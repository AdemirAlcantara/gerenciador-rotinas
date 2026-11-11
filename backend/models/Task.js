import mongoose from 'mongoose';
import TaskModel from './schemas/TaskSchema.js';
import { formatDateString, formatTimeHHmm } from '../utils/utils.js';

class Task {

    constructor({ title, description, dueDate, timeBlock, targetTime, startTime, endTime, status, priority, notified, notifiedAt, routine, category, user }) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate || formatDateString(new Date());
        this.timeBlock = timeBlock;
        this.targetTime = targetTime || startTime || null;
        this.startTime = startTime || targetTime || null;
        this.endTime = endTime;
        this.status = status;
        this.priority = priority;
        this.notified = notified ?? false;
        this.notifiedAt = notifiedAt ?? null;
        this.routine = routine;
        this.category = category;
        this.user = user;
    }

    async save() {
        const newTask = new TaskModel({
            title: this.title,
            description: this.description,
            dueDate: this.dueDate,
            timeBlock: this.timeBlock,
            targetTime: this.targetTime,
            startTime: this.startTime,
            endTime: this.endTime,
            status: this.status,
            priority: this.priority,
            notified: this.notified,
            notifiedAt: this.notifiedAt,
            routine: this.routine,
            category: this.category,
            user: this.user
        });

        return await newTask.save();
    }

    static async findAll() {
        return await TaskModel.find()
            .populate('routine')
            .populate('category')
            .populate('user', '-password')
            .sort({ dueDate: -1, targetTime: 1, title: 1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await TaskModel.findById(id)
            .populate('routine')
            .populate('category')
            .populate('user', '-password');
    }

    static async findByRoutine(routineId) {
        if (!mongoose.Types.ObjectId.isValid(routineId)) {
            return [];
        }
        return await TaskModel.find({ routine: routineId })
            .populate('routine')
            .populate('category')
            .populate('user', '-password')
            .sort({ targetTime: 1, title: 1 });
    }

    static async findByTimeBlock(timeBlock) {
        return await TaskModel.find({ timeBlock })
            .populate('routine')
            .populate('category')
            .populate('user', '-password')
            .sort({ targetTime: 1, title: 1 });
    }

    static async findByStatus(status) {
        return await TaskModel.find({ status })
            .populate('routine')
            .populate('category')
            .populate('user', '-password')
            .sort({ targetTime: 1, title: 1 });
    }

    static async findByUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }
        return await TaskModel.find({ user: userId })
            .populate('routine')
            .populate('category')
            .populate('user', '-password')
            .sort({ dueDate: -1, targetTime: 1, title: 1 });
    }

    /**
     * Lógica Central 2: Notificação Instantânea de Tasks
     * Busca tarefas ativas cujo targetTime foi atingido e ainda não foram notificadas.
     */
    static async findDueNotifications(userId = null, dateStr = null, currentTimeHHmm = null) {
        const targetDate = dateStr || formatDateString(new Date());
        const targetTime = currentTimeHHmm || formatTimeHHmm(new Date());

        const query = {
            dueDate: targetDate,
            status: { $in: ['Pendente', 'Em Andamento'] },
            notified: false,
            targetTime: { $ne: null, $lte: targetTime }
        };

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.user = userId;
        }

        return await TaskModel.find(query)
            .populate('routine')
            .populate('category')
            .populate('user', '-password')
            .sort({ targetTime: 1 });
    }

    static async markAsNotified(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await TaskModel.findByIdAndUpdate(
            id,
            { notified: true, notifiedAt: new Date() },
            { new: true }
        )
            .populate('routine')
            .populate('category')
            .populate('user', '-password');
    }

    static async update(id, { title, description, dueDate, timeBlock, targetTime, startTime, endTime, status, priority, notified, routine, category, user }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await TaskModel.findByIdAndUpdate(
            id,
            { title, description, dueDate, timeBlock, targetTime, startTime, endTime, status, priority, notified, routine, category, user },
            { new: true, runValidators: true }
        )
            .populate('routine')
            .populate('category')
            .populate('user', '-password');
    }

    static async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await TaskModel.findByIdAndDelete(id);
    }

}

export default Task;
