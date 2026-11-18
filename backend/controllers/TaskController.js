import Task from '../models/Task.js';
import HabitCheckIn from '../models/HabitCheckIn.js';
import HabitCategory from '../models/HabitCategory.js';

class TaskController {

    static async create(req, res) {
        try {
            const {
                title,
                description,
                dueDate,
                timeBlock,
                targetTime,
                startTime,
                endTime,
                status,
                priority,
                notified,
                notifiedAt,
                habitCheckIn,
                category
            } = req.body;
            if (habitCheckIn) {
                const ownedHabitCheckIn = await HabitCheckIn.findById(habitCheckIn);
                if (!ownedHabitCheckIn || (ownedHabitCheckIn.user?._id || ownedHabitCheckIn.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Check-in inválido para o usuário atual' });
                }
            }
            if (category) {
                const ownedCategory = await HabitCategory.findById(category);
                if (!ownedCategory || (ownedCategory.user?._id || ownedCategory.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Categoria inválida para o usuário atual' });
                }
            }
            const newTask = new Task({
                title,
                description,
                dueDate,
                timeBlock,
                targetTime,
                startTime,
                endTime,
                status,
                priority,
                notified,
                notifiedAt,
                habitCheckIn,
                category,
                user: req.user.id
            });
            const saved = await newTask.save();
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const { habitCheckIn, timeBlock, status } = req.query;
            let tasks = await Task.findByUser(req.user.id);

            if (habitCheckIn) {
                tasks = tasks.filter((task) =>
                    (task.habitCheckIn?._id || task.habitCheckIn)?.toString() === habitCheckIn
                );
            }
            if (timeBlock) {
                tasks = tasks.filter((task) => task.timeBlock === timeBlock);
            }
            if (status) {
                tasks = tasks.filter((task) => task.status === status);
            }

            return res.status(200).json(tasks);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async findById(req, res) {
        try {
            const task = await Task.findById(req.params.id);
            if (!task) {
                return res.status(404).json({ error: 'Tarefa não encontrada' });
            }
            if ((task.user?._id || task.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a esta tarefa' });
            }
            return res.status(200).json(task);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const existing = await Task.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Tarefa não encontrada' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a esta tarefa' });
            }
            if (req.body.habitCheckIn) {
                const ownedHabitCheckIn = await HabitCheckIn.findById(req.body.habitCheckIn);
                if (!ownedHabitCheckIn || (ownedHabitCheckIn.user?._id || ownedHabitCheckIn.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Check-in inválido para o usuário atual' });
                }
            }
            if (req.body.category) {
                const ownedCategory = await HabitCategory.findById(req.body.category);
                if (!ownedCategory || (ownedCategory.user?._id || ownedCategory.user)?.toString() !== req.user.id) {
                    return res.status(400).json({ error: 'Categoria inválida para o usuário atual' });
                }
            }
            const updated = await Task.update(req.params.id, {
                ...req.body,
                user: req.user.id
            });
            if (!updated) {
                return res.status(404).json({ error: 'Tarefa não encontrada' });
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const existing = await Task.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Tarefa não encontrada' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a esta tarefa' });
            }
            const deleted = await Task.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Tarefa não encontrada' });
            }
            return res.status(200).json({ message: 'Tarefa removida com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}

export default TaskController;

