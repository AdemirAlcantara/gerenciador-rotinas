import mongoose, { mongo } from 'mongoose';

const HabitSchema = new mongoose.Schema(
    {
        habit: { type: String, required: true },
        description: { type: String, required: false },
        frequency: { type: String, enum: ['Diário', 'Semanal', 'Mensal'], required: true },
        targetTime: {
            type: String,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de horário inválido (esperado HH:mm)'],
            required: false,
            default: null
        },
        period: {
            type: String,
            enum: ['Manha', 'Tarde', 'Noite', 'Qualquer'],
            default: 'Qualquer'
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HabitCategory',
            required: true
        }
    },
    {
        timestamps: true,
    }
);

const HabitModel = mongoose.model('Habit', HabitSchema);

export default HabitModel;