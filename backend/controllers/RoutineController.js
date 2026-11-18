import Routine from '../models/Routine.js';
import Habit from '../models/Habit.js';
import HabitCategory from '../models/HabitCategory.js';

class RoutineController {

    static async create(req, res) {
        try {
            const { date, habit, category, status, completedAt, mood, energyLevel, notes } = req.body;
            if (habit) {
                const ownedHabit = await Habit.findById(habit);
                if (!ownedHabit || (ownedHabit.user?._id || ownedHabit.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Hábito inválido para o usuário atual' });
                }
            }
            if (category) {
                const ownedCategory = await HabitCategory.findById(category);
                if (!ownedCategory || (ownedCategory.user?._id || ownedCategory.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Categoria inválida para o usuário atual' });
                }
            }
            const newRoutine = new Routine({
                date,
                habit,
                user: req.user.id,
                category,
                status,
                completedAt,
                mood,
                energyLevel,
                notes
            });
            const saved = await newRoutine.save();
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const { date, status } = req.query;
            let routines = await Routine.findByUser(req.user.id);

            if (date) {
                routines = routines.filter((routine) => routine.dateString === date);
            }
            if (status) {
                routines = routines.filter((routine) => routine.status === status);
            }

            return res.status(200).json(routines);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async findById(req, res) {
        try {
            const routine = await Routine.findById(req.params.id);
            if (!routine) {
                return res.status(404).json({ error: 'Registro de rotina não encontrado' });
            }
            if ((routine.user?._id || routine.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a este registro de rotina' });
            }
            return res.status(200).json(routine);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const existing = await Routine.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Registro de rotina não encontrado' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a este registro de rotina' });
            }
            if (req.body.habit) {
                const ownedHabit = await Habit.findById(req.body.habit);
                if (!ownedHabit || (ownedHabit.user?._id || ownedHabit.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Hábito inválido para o usuário atual' });
                }
            }
            if (req.body.category) {
                const ownedCategory = await HabitCategory.findById(req.body.category);
                if (!ownedCategory || (ownedCategory.user?._id || ownedCategory.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Categoria inválida para o usuário atual' });
                }
            }
            const updated = await Routine.update(req.params.id, {
                ...req.body,
                user: req.user.id
            });
            if (!updated) {
                return res.status(404).json({ error: 'Registro de rotina não encontrado' });
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const existing = await Routine.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Registro de rotina não encontrado' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a este registro de rotina' });
            }
            const deleted = await Routine.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Registro de rotina não encontrado' });
            }
            return res.status(200).json({ message: 'Registro de rotina removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}

export default RoutineController;

