import mongoose from "mongoose";

const HabitCategorySchema = new mongoose.Schema(
    {
        category: { type: String, required: true, unique: true },
        descripition: { type: String, required: false }
    },
    {
        timestamps: true,
    }
)

const HabitCategoryModel = mongoose.model('HabitCategory', HabitCategorySchema);

export default HabitCategoryModel;