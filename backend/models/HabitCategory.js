import mongoose from 'mongoose';
import HabitCategoryModel from './schemas/HabitCategorySchema.js';

class HabitCategory {

    constructor({ category, descripition }) {
        this.category = category;
        this.descripition = descripition;
    }

    async save() {
        const newHabitCategory = new HabitCategoryModel({
            category: this.category,
            descripition: this.descripition
        });

        return await newHabitCategory.save();
    }

    static async findAll() {
        return await HabitCategoryModel.find().sort({ category: 1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await HabitCategoryModel.findById(id);
    }

    static async findByCategory(category) {
        return await HabitCategoryModel.findOne({ category });
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


