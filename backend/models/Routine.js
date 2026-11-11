import mongoose from 'mongoose';
import RoutineModel from './schemas/RoutineSchema.js';
import Habit from './Habit.js';
import { formatDateString, formatTimeHHmm } from '../utils/utils.js';

class Routine {

    constructor({ date, dateString, habit, user, category, status, completedAt, mood, energyLevel, notes }) {
        const resolvedDate = date ? new Date(date) : new Date();
        this.date = resolvedDate;
        this.dateString = dateString || formatDateString(resolvedDate);
        this.habit = habit;
        this.user = user;
        this.category = category;
        this.status = status;
        this.completedAt = completedAt;
        this.mood = mood;
        this.energyLevel = energyLevel;
        this.notes = notes;
    }

    async save() {
        const newRoutine = new RoutineModel({
            date: this.date,
            dateString: this.dateString,
            habit: this.habit,
            user: this.user,
            category: this.category,
            status: this.status,
            completedAt: this.completedAt,
            mood: this.mood,
            energyLevel: this.energyLevel,
            notes: this.notes
        });

        return await newRoutine.save();
    }

    static async findAll() {
        return await RoutineModel.find()
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password')
            .sort({ dateString: -1, completedAt: 1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await RoutineModel.findById(id)
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password');
    }

    static async findByDate(date, userId = null) {
        const dateStr = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? date
            : formatDateString(new Date(date));

        const query = { dateString: dateStr };
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.user = userId;
        }

        return await RoutineModel.find(query)
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password')
            .sort({ completedAt: 1 });
    }

    static async findByUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }
        return await RoutineModel.find({ user: userId })
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password')
            .sort({ dateString: -1 });
    }

    static async findByStatus(status, userId = null) {
        const query = { status };
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.user = userId;
        }
        return await RoutineModel.find(query)
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password')
            .sort({ dateString: -1 });
    }

    static async update(id, { date, dateString, habit, user, category, status, completedAt, mood, energyLevel, notes }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const resolvedCompletedAt = status === 'Concluído' && !completedAt
            ? formatTimeHHmm(new Date())
            : completedAt;

        return await RoutineModel.findByIdAndUpdate(
            id,
            {
                date,
                dateString,
                habit,
                user,
                category,
                status,
                completedAt: resolvedCompletedAt,
                mood,
                energyLevel,
                notes
            },
            { new: true, runValidators: true }
        )
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password');
    }

    static async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await RoutineModel.findByIdAndDelete(id);
    }

    /**
     * Lógica Central 1: Geração Automática do Dia
     * Instancia a Routine com base nos hábitos ativos configurados para aquele dia da semana/mês.
     */
    static async generateDailyForUser(userId = null, targetDate = new Date()) {
        const dateObj = targetDate instanceof Date ? targetDate : new Date(targetDate);
        const dateString = formatDateString(dateObj);

        const activeHabits = await Habit.findActiveForDate(userId, dateObj);
        if (!activeHabits.length) {
            return { dateString, createdCount: 0, routines: [] };
        }

        const operations = activeHabits.map((h) => {
            const habitUserId = userId || h.user?._id || h.user || null;
            const categoryId = h.category?._id || h.category || null;
            return {
                updateOne: {
                    filter: {
                        user: habitUserId,
                        habit: h._id,
                        dateString
                    },
                    update: {
                        $setOnInsert: {
                            date: dateObj,
                            dateString,
                            habit: h._id,
                            user: habitUserId,
                            category: categoryId,
                            status: 'Pendente',
                            completedAt: null,
                            mood: 'Neutro',
                            energyLevel: 'Média',
                            notes: ''
                        }
                    },
                    upsert: true
                }
            };
        });

        const bulkResult = await RoutineModel.bulkWrite(operations, { ordered: false });
        const routines = await Routine.findByDate(dateString, userId);

        return {
            dateString,
            createdCount: bulkResult.upsertedCount || 0,
            totalForDay: routines.length,
            routines
        };
    }

    /**
     * Lógica Central 3: Cálculo de Consistência (Streak / Score)
     * Calcula dias consecutivos cumpridos por hábito e taxa percentual de aderência semanal e mensal.
     */
    static async getConsistencyStats(userId = null, referenceDate = new Date()) {
        const query = {};
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.user = userId;
        }

        const allRoutines = await RoutineModel.find(query)
            .populate({ path: 'habit', populate: { path: 'category' } })
            .sort({ dateString: -1 });

        return Routine.computeConsistencyFromRecords(allRoutines, referenceDate);
    }

    static computeConsistencyFromRecords(records, referenceDate = new Date()) {
        const refDateObj = referenceDate instanceof Date ? new Date(referenceDate) : new Date(referenceDate);
        const todayStr = formatDateString(refDateObj);

        const sevenDaysAgoObj = new Date(refDateObj);
        sevenDaysAgoObj.setDate(sevenDaysAgoObj.getDate() - 6);
        const sevenDaysAgoStr = formatDateString(sevenDaysAgoObj);

        const thirtyDaysAgoObj = new Date(refDateObj);
        thirtyDaysAgoObj.setDate(thirtyDaysAgoObj.getDate() - 29);
        const thirtyDaysAgoStr = formatDateString(thirtyDaysAgoObj);

        const weeklyRecords = records.filter((r) => r.dateString >= sevenDaysAgoStr && r.dateString <= todayStr);
        const monthlyRecords = records.filter((r) => r.dateString >= thirtyDaysAgoStr && r.dateString <= todayStr);

        const calcAdherence = (list) => {
            if (!list.length) return { completed: 0, skipped: 0, pending: 0, total: 0, percentage: 0 };
            const completed = list.filter((r) => r.status === 'Concluído').length;
            const skipped = list.filter((r) => r.status === 'Pulado').length;
            const pending = list.filter((r) => r.status === 'Pendente').length;
            const percentage = Number(((completed / list.length) * 100).toFixed(1));
            return { completed, skipped, pending, total: list.length, percentage };
        };

        const weeklyAdherence = calcAdherence(weeklyRecords);
        const monthlyAdherence = calcAdherence(monthlyRecords);

        // Agrupa registros por hábito para calcular currentStreak e bestStreak
        const byHabit = new Map();
        for (const rec of records) {
            const habitId = String(rec.habit?._id || rec.habit);
            if (!byHabit.has(habitId)) {
                byHabit.set(habitId, {
                    habitId,
                    habitName: rec.habit?.habit || 'Hábito',
                    frequency: rec.habit?.frequency || 'Diário',
                    category: rec.habit?.category?.category || null,
                    records: []
                });
            }
            byHabit.get(habitId).records.push(rec);
        }

        const habitStreaks = [];
        for (const [, group] of byHabit.entries()) {
            const sortedAsc = [...group.records].sort((a, b) => a.dateString.localeCompare(b.dateString));

            let bestStreak = 0;
            let runningStreak = 0;
            for (const item of sortedAsc) {
                if (item.status === 'Concluído') {
                    runningStreak += 1;
                    if (runningStreak > bestStreak) {
                        bestStreak = runningStreak;
                    }
                } else if (item.dateString === todayStr && item.status === 'Pendente') {
                    // Dia atual ainda pendente não zera o streak acumulado até ontem
                    continue;
                } else {
                    runningStreak = 0;
                }
            }

            // Calcula currentStreak olhando do mais recente para trás
            const sortedDesc = [...sortedAsc].reverse();
            let currentStreak = 0;
            for (const item of sortedDesc) {
                if (item.status === 'Concluído') {
                    currentStreak += 1;
                } else if (item.dateString === todayStr && item.status === 'Pendente') {
                    continue;
                } else {
                    break;
                }
            }

            const habitAdherence = calcAdherence(group.records);
            habitStreaks.push({
                habitId: group.habitId,
                habitName: group.habitName,
                frequency: group.frequency,
                category: group.category,
                currentStreak,
                bestStreak,
                adherencePercentage: habitAdherence.percentage,
                completedCount: habitAdherence.completed,
                totalCount: habitAdherence.total
            });
        }

        // Resumo de humor e energia
        const moodDistribution = {};
        const energyDistribution = {};
        for (const rec of monthlyRecords) {
            if (rec.mood) moodDistribution[rec.mood] = (moodDistribution[rec.mood] || 0) + 1;
            if (rec.energyLevel) energyDistribution[rec.energyLevel] = (energyDistribution[rec.energyLevel] || 0) + 1;
        }

        return {
            referenceDate: todayStr,
            weeklyAdherence,
            monthlyAdherence,
            habitStreaks,
            moodDistribution,
            energyDistribution
        };
    }

}

export default Routine;
