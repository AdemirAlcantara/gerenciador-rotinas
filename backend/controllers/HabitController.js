import Habit from '../models/Habit.js';

class HabitController {

    static async create(req, res) {
        try {
            const { habit, description, frequency, targetTime, period, category } = req.body;
            const newHabit = new Habit({ habit, description, frequency, targetTime, period, category });
            const saved = await newHabit.save();
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const { category, frequency, period } = req.query;
            let habits;

            if (category) {
                habits = await Habit.findByCategory(category);
            } else if (frequency) {
                habits = await Habit.findByFrequency(frequency);
            } else if (period) {
                habits = await Habit.findByPeriod(period);
            } else {
                habits = await Habit.findAll();
            }

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
            return res.status(200).json(habit);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const updated = await Habit.update(req.params.id, req.body);
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

