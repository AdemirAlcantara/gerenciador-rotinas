import mongoose from 'mongoose';
import { formatDateString } from '../../utils/utils.js';

const TaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: false, default: '' },
        dueDate: {
            type: String,
            required: true,
            default: () => formatDateString(new Date()),
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (esperado YYYY-MM-DD)']
        },
        targetTime: {
            type: String,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de horário inválido (esperado HH:mm)'],
            required: false,
            default: null
        },
        status: {
            type: String,
            enum: ['Pendente', 'Em Andamento', 'Concluída', 'Cancelada', 'Não realizada'],
            default: 'Pendente'
        },
        priority: {
            type: String,
            enum: ['Baixa', 'Média', 'Alta'],
            default: 'Média'
        },
        notified: {
            type: Boolean,
            default: false
        },
        notifiedAt: {
            type: Date,
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
            required: true
        }
    },
    {
        timestamps: true,
    }
);

const TaskModel = mongoose.model('Task', TaskSchema);

export default TaskModel;
