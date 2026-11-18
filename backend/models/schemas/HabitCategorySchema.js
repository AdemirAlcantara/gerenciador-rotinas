import mongoose from "mongoose";

const HabitCategorySchema = new mongoose.Schema(
    {
        category: { type: String, required: true },
        descripition: { type: String, required: false },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true,
    }
)

HabitCategorySchema.index({ user: 1, category: 1 }, { unique: true });

const HabitCategoryModel = mongoose.model('HabitCategory', HabitCategorySchema);

export default HabitCategoryModel;