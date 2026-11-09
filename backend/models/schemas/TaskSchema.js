import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: false, default: '' },
        timeBlock: {
            type: String,
            enum: ['Manha', 'Tarde', 'Noite', 'Qualquer'],
            default: 'Qualquer',
            required: true
        },
        startTime: {
            type: String,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de horário inválido (esperado HH:mm)'],
            required: false,
            default: null
        },
        endTime: {
            type: String,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de horário inválido (esperado HH:mm)'],
            required: false,
            default: null
        },
        status: {
            type: String,
            enum: ['Pendente', 'Em Andamento', 'Concluída', 'Cancelada'],
            default: 'Pendente'
        },
        priority: {
            type: String,
            enum: ['Baixa', 'Média', 'Alta'],
            default: 'Média'
        },
        routine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Routine',
            required: false,
            default: null
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HabitCategory',
            required: false,
            default: null
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

const TaskModel = mongoose.model('Task', TaskSchema);

export default TaskModel;
