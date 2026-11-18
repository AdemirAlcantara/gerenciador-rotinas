import Task from '../models/Task.js';
import HabitCategory from '../models/HabitCategory.js';
import Notification from '../models/Notification.js';

class TaskController {

    static async create(req, res) {
        try {
            const {
                title,
                description,
                dueDate,
                targetTime,
                status,
                priority,
                notified,
                notifiedAt,
                category
            } = req.body;
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
                targetTime,
                status: 'Pendente',
                priority,
                notified,
                notifiedAt,
                category,
                user: req.user.id
            });
            const saved = await newTask.save();
            await Notification.syncForTask(saved);
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const { status } = req.query;
            let tasks = await Task.findByUser(req.user.id);

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
            await Notification.syncForTask(updated);
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
            await Notification.deleteForTask(req.params.id);
            return res.status(200).json({ message: 'Tarefa removida com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}

export default TaskController;

