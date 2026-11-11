import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema(
    {
        habit: { type: String, required: true, trim: true },
        description: { type: String, required: false, default: '' },
        frequency: {
            type: String,
            enum: ['Diário', 'Semanal', 'Mensal'],
            required: true
        },
        daysOfWeek: {
            type: [
                {
                    type: Number,
                    min: 0,
                    max: 6
                }
            ],
            default: [0, 1, 2, 3, 4, 5, 6],
            validate: {
                validator: function (arr) {
                    if (this.frequency === 'Semanal') {
                        return Array.isArray(arr) && arr.length > 0;
                    }
                    return true;
                },
                message: 'Hábitos semanais devem ter pelo menos um dia da semana (0=Dom a 6=Sáb) configurado.'
            }
        },
        dayOfMonth: {
            type: Number,
            min: 1,
            max: 31,
            required: false,
            default: null
        },
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
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
            default: null
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

const HabitModel = mongoose.model('Habit', HabitSchema);

export default HabitModel;
