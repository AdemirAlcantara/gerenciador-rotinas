import mongoose from 'mongoose';

const RoutineSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        habit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Habit',
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
            default: null
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HabitCategory',
            required: false,
            default: null
        },
        status: {
            type: String,
            enum: ['Pendente', 'Concluído', 'Pulado'],
            default: 'Pendente',
            required: true
        },
        completedAt: {
            type: String,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de horário inválido (esperado HH:mm)'],
            required: false,
            default: null
        },
        mood: {
            type: String,
            enum: ['Ótimo', 'Bom', 'Neutro', 'Cansado', 'Estressado'],
            default: 'Neutro'
        },
        energyLevel: {
            type: String,
            enum: ['Alta', 'Média', 'Baixa'],
            default: 'Média'
        },
        notes: {
            type: String,
            required: false,
            default: ''
        }
    },
    {
        timestamps: true,
    }
);

const RoutineModel = mongoose.model('Routine', RoutineSchema);

export default RoutineModel;
