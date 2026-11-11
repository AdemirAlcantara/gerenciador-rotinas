import mongoose from 'mongoose';
import HabitModel from './schemas/HabitSchema.js';

class Habit {

    constructor({ habit, description, frequency, daysOfWeek, dayOfMonth, targetTime, period, category, user, active }) {
        this.habit = habit;
        this.description = description;
        this.frequency = frequency;
        this.daysOfWeek = daysOfWeek;
        this.dayOfMonth = dayOfMonth;
        this.targetTime = targetTime;
        this.period = period;
        this.category = category;
        this.user = user;
        this.active = active;
    }

    async save() {
        const newHabit = new HabitModel({
            habit: this.habit,
            description: this.description,
            frequency: this.frequency,
            daysOfWeek: this.daysOfWeek,
            dayOfMonth: this.dayOfMonth,
            targetTime: this.targetTime,
            period: this.period,
            category: this.category,
            user: this.user,
            active: this.active
        });

        return await newHabit.save();
    }

    static async findAll(filter = {}) {
        return await HabitModel.find(filter)
            .populate('category')
            .populate('user', '-password')
            .sort({ targetTime: 1, habit: 1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitModel.findById(id)
            .populate('category')
            .populate('user', '-password');
    }

    static async findByCategory(categoryId) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return [];
        }
        return await HabitModel.find({ category: categoryId })
            .populate('category')
            .populate('user', '-password')
            .sort({ habit: 1 });
    }

    static async findByUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }
        return await HabitModel.find({ user: userId })
            .populate('category')
            .populate('user', '-password')
            .sort({ targetTime: 1, habit: 1 });
    }

    static async findByFrequency(frequency) {
        return await HabitModel.find({ frequency })
            .populate('category')
            .populate('user', '-password')
            .sort({ habit: 1 });
    }

    static async findByPeriod(period) {
        return await HabitModel.find({ period })
            .populate('category')
            .populate('user', '-password')
            .sort({ habit: 1 });
    }

    static async findActiveForDate(userId = null, date = new Date()) {
        const targetDate = date instanceof Date ? date : new Date(date);
        const dayOfWeek = targetDate.getDay();
        const dayOfMonth = targetDate.getDate();

        const query = {
            active: true,
            $or: [
                { frequency: 'Diário' },
                { frequency: 'Semanal', daysOfWeek: dayOfWeek },
                { frequency: 'Mensal', $or: [{ dayOfMonth: dayOfMonth }, { dayOfMonth: null }] }
            ]
        };

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.user = userId;
        }

        return await HabitModel.find(query)
            .populate('category')
            .sort({ targetTime: 1, habit: 1 });
    }

    static async update(id, { habit, description, frequency, daysOfWeek, dayOfMonth, targetTime, period, category, user, active }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitModel.findByIdAndUpdate(
            id,
            { habit, description, frequency, daysOfWeek, dayOfMonth, targetTime, period, category, user, active },
            { new: true, runValidators: true }
        )
            .populate('category')
            .populate('user', '-password');
    }

    static async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitModel.findByIdAndDelete(id);
    }

}

export default Habit;
