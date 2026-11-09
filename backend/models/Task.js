import mongoose from 'mongoose';
import TaskModel from './schemas/TaskSchema.js';

class Task {

    constructor({ title, description, timeBlock, startTime, endTime, status, priority, routine, category, user }) {
        this.title = title;
        this.description = description;
        this.timeBlock = timeBlock;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.priority = priority;
        this.routine = routine;
        this.category = category;
        this.user = user;
    }

    async save() {
        const newTask = new TaskModel({
            title: this.title,
            description: this.description,
            timeBlock: this.timeBlock,
            startTime: this.startTime,
            endTime: this.endTime,
            status: this.status,
            priority: this.priority,
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
            .sort({ startTime: 1, title: 1 });
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
            .sort({ startTime: 1, title: 1 });
    }

    static async findByTimeBlock(timeBlock) {
        return await TaskModel.find({ timeBlock })
            .populate('routine')
            .populate('category')
            .populate('user', '-password')
            .sort({ startTime: 1, title: 1 });
    }

    static async findByStatus(status) {
        return await TaskModel.find({ status })
            .populate('routine')
            .populate('category')
            .populate('user', '-password')
            .sort({ startTime: 1, title: 1 });
    }

    static async findByUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }
        return await TaskModel.find({ user: userId })
            .populate('routine')
            .populate('category')
            .populate('user', '-password')
            .sort({ startTime: 1, title: 1 });
    }

    static async update(id, { title, description, timeBlock, startTime, endTime, status, priority, routine, category, user }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await TaskModel.findByIdAndUpdate(
            id,
            { title, description, timeBlock, startTime, endTime, status, priority, routine, category, user },
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
