import mongoose from 'mongoose';
import HabitCategoryModel from './schemas/HabitCategorySchema.js';

class HabitCategory {

    constructor({ category, descripition, user }) {
        this.category = category;
        this.descripition = descripition;
        this.user = user;
    }

    async save() {
        const newHabitCategory = new HabitCategoryModel({
            category: this.category,
            descripition: this.descripition,
            user: this.user
        });

        return await newHabitCategory.save();
    }

    static async findAll(userId = null) {
        const filter = userId ? { user: userId } : {};
        return await HabitCategoryModel.find(filter).sort({ category: 1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitCategoryModel.findById(id);
    }

    static async findByCategory(category, userId = null) {
        const filter = { category };
        if (userId) filter.user = userId;
        return await HabitCategoryModel.findOne(filter);
    }

    static async update(id, { category, descripition }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitCategoryModel.findByIdAndUpdate(
            id,
            { category, descripition },
            { new: true, runValidators: true }
        );
    }

    static async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitCategoryModel.findByIdAndDelete(id);
    }

}

export default HabitCategory;


