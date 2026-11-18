import mongoose from 'mongoose';
import HabitCheckInModel from './schemas/HabitCheckInSchema.js';
import Habit from './Habit.js';
import { formatDateString, formatTimeHHmm } from '../utils/utils.js';

class HabitCheckIn {

    constructor({ date, dateString, habit, user, status, completedAt, mood, notes }) {
        const resolvedDate = date ? new Date(date) : new Date();
        this.date = resolvedDate;
        this.dateString = dateString || formatDateString(resolvedDate);
        this.habit = habit;
        this.user = user;
        this.status = status;
        this.completedAt = completedAt;
        this.mood = mood;
        this.notes = notes;
    }

    async save() {
        const newHabitCheckIn = new HabitCheckInModel({
            date: this.date,
            dateString: this.dateString,
            habit: this.habit,
            user: this.user,
            status: this.status,
            completedAt: this.completedAt,
            mood: this.mood,
            notes: this.notes
        });

        return await newHabitCheckIn.save();
    }

    static async findAll() {
        return await HabitCheckInModel.find()
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('user', '-password')
            .sort({ dateString: -1, completedAt: 1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitCheckInModel.findById(id)
            .populate({ path: 'habit', populate: { path: 'category' } })
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

        return await HabitCheckInModel.find(query)
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('user', '-password')
            .sort({ completedAt: 1 });
    }

    static async findByUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }
        return await HabitCheckInModel.find({ user: userId })
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('user', '-password')
            .sort({ dateString: -1 });
    }

    static async findLatestByUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }

        const records = await HabitCheckInModel.find({ user: userId })
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('user', '-password')
            .sort({ dateString: -1, updatedAt: -1 });

        const latestByHabit = new Map();
        for (const record of records) {
            const habitId = String(record.habit?._id || record.habit);
            if (!habitId || latestByHabit.has(habitId)) {
                continue;
            }
            latestByHabit.set(habitId, record);
        }

        return Array.from(latestByHabit.values());
    }

    static async findByStatus(status, userId = null) {
        const query = { status };
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.user = userId;
        }
        return await HabitCheckInModel.find(query)
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('user', '-password')
            .sort({ dateString: -1 });
    }

    static async update(id, { date, dateString, habit, user, status, completedAt, mood, notes }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const resolvedCompletedAt = status === 'Concluído' && !completedAt
            ? formatTimeHHmm(new Date())
            : completedAt;

        return await HabitCheckInModel.findByIdAndUpdate(
            id,
            {
                date,
                dateString,
                habit,
                user,
                status,
                completedAt: resolvedCompletedAt,
                mood,
                notes
            },
            { new: true, runValidators: true }
        )
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('user', '-password');
    }

    static async upsertForUser({
        date,
        dateString,
        habit,
        user,
        status,
        completedAt,
        mood,
        notes
    }) {
        if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(habit)) {
            return null;
        }

        const resolvedDate = date ? new Date(date) : new Date();
        const resolvedDateString = dateString || formatDateString(resolvedDate);
        const resolvedCompletedAt = status === 'Concluído' && !completedAt
            ? formatTimeHHmm(new Date())
            : (completedAt || null);

        const filter = {
            user,
            habit,
            dateString: resolvedDateString
        };
        const update = {
            date: resolvedDate,
            dateString: resolvedDateString,
            habit,
            user,
            status: status || 'Pendente',
            completedAt: resolvedCompletedAt,
            mood: mood || 'Neutro',
            notes: notes || ''
        };

        const existing = await HabitCheckInModel.findOne(filter);
        if (existing) {
            return await HabitCheckInModel.findByIdAndUpdate(
                existing._id,
                { $set: update },
                { new: true, runValidators: true }
            )
                .populate({ path: 'habit', populate: { path: 'category' } })
                .populate('user', '-password');
        }

        try {
            return await HabitCheckInModel.findOneAndUpdate(
                filter,
                { $set: update },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            )
                .populate({ path: 'habit', populate: { path: 'category' } })
                .populate('user', '-password');
        } catch (error) {
            if (error?.code !== 11000) {
                throw error;
            }

            const concurrentRecord = await HabitCheckInModel.findOne(filter);
            if (!concurrentRecord) {
                throw error;
            }

            return await HabitCheckInModel.findByIdAndUpdate(
                concurrentRecord._id,
                { $set: update },
                { new: true, runValidators: true }
            )
                .populate({ path: 'habit', populate: { path: 'category' } })
                .populate('user', '-password');
        }
    }

    static async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitCheckInModel.findByIdAndDelete(id);
    }

    /**
     * Lógica Central 1: Geração Automática do Dia
     * Instancia os check-ins com base nos hábitos ativos configurados para aquele dia da semana/mês.
     */
    static async generateDailyForUser(userId = null, targetDate = new Date()) {
        const dateObj = targetDate instanceof Date ? targetDate : new Date(targetDate);
        const dateString = formatDateString(dateObj);

        const activeHabits = await Habit.findActiveForDate(userId, dateObj);
        if (!activeHabits.length) {
            return { dateString, createdCount: 0, habitCheckIns: [] };
        }

        const operations = activeHabits.map((h) => {
            const habitUserId = userId || h.user?._id || h.user || null;
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
                            status: 'Pendente',
                            completedAt: null,
                            mood: 'Neutro',
                            notes: ''
                        }
                    },
                    upsert: true
                }
            };
        });

        const bulkResult = await HabitCheckInModel.bulkWrite(operations, { ordered: false });
        const habitCheckIns = await HabitCheckIn.findByDate(dateString, userId);

        return {
            dateString,
            createdCount: bulkResult.upsertedCount || 0,
            totalForDay: habitCheckIns.length,
            habitCheckIns
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

        const allHabitCheckIns = await HabitCheckInModel.find(query)
            .populate({ path: 'habit', populate: { path: 'category' } })
            .sort({ dateString: -1 });

        return HabitCheckIn.computeConsistencyFromRecords(allHabitCheckIns, referenceDate);
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

        // Resumo de humor
        const moodDistribution = {};
        for (const rec of monthlyRecords) {
            if (rec.mood) moodDistribution[rec.mood] = (moodDistribution[rec.mood] || 0) + 1;
        }

        return {
            referenceDate: todayStr,
            weeklyAdherence,
            monthlyAdherence,
            habitStreaks,
            moodDistribution
        };
    }

}

export default HabitCheckIn;
