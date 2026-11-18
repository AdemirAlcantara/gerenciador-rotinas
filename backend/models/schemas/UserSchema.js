import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de e-mail inválido']
        },
        password: { type: String, required: true },
        lastHabitCheckInGeneratedDate: {
            type: String,
            required: false,
            default: null,
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (esperado YYYY-MM-DD)']
        },
        bio: { type: String, required: false, default: '' },
        passwordResetCodeHash: { type: String, required: false, select: false },
        passwordResetExpires: { type: Date, required: false, select: false },
        productivityGoals: {
            dailyHabitsTarget: { type: Number, default: 3, min: 0 },
            dailyTasksTarget: { type: Number, default: 5, min: 0 },
            focusDescription: { type: String, required: false, default: '' }
        },
        preferences: {
            theme: {
                type: String,
                enum: ['Claro', 'Escuro', 'Sistema'],
                default: 'Sistema'
            },
            notifications: { type: Boolean, default: true },
            preferredPeriod: {
                type: String,
                enum: ['Manha', 'Tarde', 'Noite', 'Qualquer'],
                default: 'Qualquer'
            }
        }
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
