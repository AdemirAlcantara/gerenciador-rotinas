import Task from '../models/Task.js';

class TaskController {

    static async create(req, res) {
        try {
            const { title, description, timeBlock, startTime, endTime, status, priority, routine, category, user } = req.body;
            const newTask = new Task({
                title,
                description,
                timeBlock,
                startTime,
                endTime,
                status,
                priority,
                routine,
                category,
                user
            });
            const saved = await newTask.save();
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const { routine, timeBlock, status, user } = req.query;
            let tasks;

            if (routine) {
                tasks = await Task.findByRoutine(routine);
            } else if (timeBlock) {
                tasks = await Task.findByTimeBlock(timeBlock);
            } else if (status) {
                tasks = await Task.findByStatus(status);
            } else if (user) {
                tasks = await Task.findByUser(user);
            } else {
                tasks = await Task.findAll();
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
            return res.status(200).json(task);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const updated = await Task.update(req.params.id, req.body);
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

