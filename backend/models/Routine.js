import mongoose from 'mongoose';
import RoutineModel from './schemas/RoutineSchema.js';

class Routine {

    constructor({ date, habit, user, category, status, completedAt, mood, energyLevel, notes }) {
        this.date = date;
        this.habit = habit;
        this.user = user;
        this.category = category;
        this.status = status;
        this.completedAt = completedAt;
        this.mood = mood;
        this.energyLevel = energyLevel;
        this.notes = notes;
    }

    async save() {
        const newRoutine = new RoutineModel({
            date: this.date,
            habit: this.habit,
            user: this.user,
            category: this.category,
            status: this.status,
            completedAt: this.completedAt,
            mood: this.mood,
            energyLevel: this.energyLevel,
            notes: this.notes
        });

        return await newRoutine.save();
    }

    static async findAll() {
        return await RoutineModel.find()
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password')
            .sort({ date: -1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await RoutineModel.findById(id)
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password');
    }

    static async findByDate(date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        return await RoutineModel.find({ date: { $gte: start, $lte: end } })
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password')
            .sort({ completedAt: 1 });
    }

    static async findByUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }
        return await RoutineModel.find({ user: userId })
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password')
            .sort({ date: -1 });
    }

    static async findByStatus(status) {
        return await RoutineModel.find({ status })
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password')
            .sort({ date: -1 });
    }

    static async update(id, { date, habit, user, category, status, completedAt, mood, energyLevel, notes }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await RoutineModel.findByIdAndUpdate(
            id,
            { date, habit, user, category, status, completedAt, mood, energyLevel, notes },
            { new: true, runValidators: true }
        )
            .populate({ path: 'habit', populate: { path: 'category' } })
            .populate('category')
            .populate('user', '-password');
    }

    static async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await RoutineModel.findByIdAndDelete(id);
    }

}

export default Routine;
