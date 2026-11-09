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
        bio: { type: String, required: false, default: '' },
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
