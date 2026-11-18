import HabitCheckIn from '../models/HabitCheckIn.js';
import Habit from '../models/Habit.js';
import User from '../models/User.js';
import { formatDateString } from '../utils/utils.js';

class HabitCheckInController {

    static async generateDaily(req, res) {
        try {
            const today = new Date();
            const result = await HabitCheckIn.generateDailyForUser(req.user.id, today);
            await User.updateLastHabitCheckInGeneratedDate(req.user.id, formatDateString(today));
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { date, habit, status, completedAt, mood, notes } = req.body;
            if (habit) {
                const ownedHabit = await Habit.findById(habit);
                if (!ownedHabit || (ownedHabit.user?._id || ownedHabit.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Hábito inválido para o usuário atual' });
                }
            }
            const newHabitCheckIn = new HabitCheckIn({
                date,
                habit,
                user: req.user.id,
                status,
                completedAt,
                mood,
                notes
            });
            const saved = await newHabitCheckIn.save();
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const { date, status } = req.query;
            let habitCheckIns = await HabitCheckIn.findByUser(req.user.id);

            if (date) {
                habitCheckIns = habitCheckIns.filter((checkIn) => checkIn.dateString === date);
            }
            if (status) {
                habitCheckIns = habitCheckIns.filter((checkIn) => checkIn.status === status);
            }

            return res.status(200).json(habitCheckIns);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async findById(req, res) {
        try {
            const habitCheckIn = await HabitCheckIn.findById(req.params.id);
            if (!habitCheckIn) {
                return res.status(404).json({ error: 'Check-in não encontrado' });
            }
            if ((habitCheckIn.user?._id || habitCheckIn.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a este check-in' });
            }
            return res.status(200).json(habitCheckIn);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const existing = await HabitCheckIn.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Check-in não encontrado' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a este check-in' });
            }
            if (req.body.habit) {
                const ownedHabit = await Habit.findById(req.body.habit);
                if (!ownedHabit || (ownedHabit.user?._id || ownedHabit.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Hábito inválido para o usuário atual' });
                }
            }
            const updated = await HabitCheckIn.update(req.params.id, {
                ...req.body,
                user: req.user.id
            });
            if (!updated) {
                return res.status(404).json({ error: 'Check-in não encontrado' });
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const existing = await HabitCheckIn.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Check-in não encontrado' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a este check-in' });
            }
            const deleted = await HabitCheckIn.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Check-in não encontrado' });
            }
            return res.status(200).json({ message: 'Check-in removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}

export default HabitCheckInController;

