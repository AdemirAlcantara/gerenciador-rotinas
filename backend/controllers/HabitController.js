import Habit from '../models/Habit.js';
import HabitCategory from '../models/HabitCategory.js';

class HabitController {

    static async create(req, res) {
        try {
            const {
                habit,
                description,
                frequency,
                daysOfWeek,
                dayOfMonth,
                targetTime,
                period,
                category,
                active
            } = req.body;
            if (category) {
                const ownedCategory = await HabitCategory.findById(category);
                if (!ownedCategory || (ownedCategory.user?._id || ownedCategory.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Categoria inválida para o usuário atual' });
                }
            }
            const newHabit = new Habit({
                habit,
                description,
                frequency,
                daysOfWeek,
                dayOfMonth,
                targetTime,
                period,
                category,
                user: req.user.id,
                active
            });
            const saved = await newHabit.save();
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const { category, frequency, period } = req.query;
            const filter = { user: req.user.id };
            if (category) filter.category = category;
            if (frequency) filter.frequency = frequency;
            if (period) filter.period = period;
            const habits = await Habit.findAll(filter);

            return res.status(200).json(habits);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async findById(req, res) {
        try {
            const habit = await Habit.findById(req.params.id);
            if (!habit) {
                return res.status(404).json({ error: 'Hábito não encontrado' });
            }
            if ((habit.user?._id || habit.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a este hábito' });
            }
            return res.status(200).json(habit);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const existing = await Habit.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Hábito não encontrado' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a este hábito' });
            }
            if (req.body.category) {
                const ownedCategory = await HabitCategory.findById(req.body.category);
                if (!ownedCategory || (ownedCategory.user?._id || ownedCategory.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Categoria inválida para o usuário atual' });
                }
            }
            const updated = await Habit.update(req.params.id, {
                ...req.body,
                user: req.user.id
            });
            if (!updated) {
                return res.status(404).json({ error: 'Hábito não encontrado' });
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const existing = await Habit.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Hábito não encontrado' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a este hábito' });
            }
            const deleted = await Habit.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Hábito não encontrado' });
            }
            return res.status(200).json({ message: 'Hábito removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}

export default HabitController;

