import mongoose from 'mongoose';
import HabitModel from './schemas/HabitSchema.js';

class Habit {

    constructor({ habit, description, frequency, targetTime, period, category }) {
        this.habit = habit;
        this.description = description;
        this.frequency = frequency;
        this.targetTime = targetTime;
        this.period = period;
        this.category = category;
    }

    async save() {
        const newHabit = new HabitModel({
            habit: this.habit,
            description: this.description,
            frequency: this.frequency,
            targetTime: this.targetTime,
            period: this.period,
            category: this.category
        });

        return await newHabit.save();
    }

    static async findAll() {
        return await HabitModel.find()
            .populate('category')
            .sort({ habit: 1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitModel.findById(id).populate('category');
    }

    static async findByCategory(categoryId) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return [];
        }
        return await HabitModel.find({ category: categoryId })
            .populate('category')
            .sort({ habit: 1 });
    }

    static async findByFrequency(frequency) {
        return await HabitModel.find({ frequency })
            .populate('category')
            .sort({ habit: 1 });
    }

    static async findByPeriod(period) {
        return await HabitModel.find({ period })
            .populate('category')
            .sort({ habit: 1 });
    }

    static async update(id, { habit, description, frequency, targetTime, period, category }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitModel.findByIdAndUpdate(
            id,
            { habit, description, frequency, targetTime, period, category },
            { new: true, runValidators: true }
        ).populate('category');
    }

    static async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitModel.findByIdAndDelete(id);
    }

}

export default Habit;

