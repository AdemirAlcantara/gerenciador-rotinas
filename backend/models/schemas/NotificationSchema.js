import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true
        },
        dueDate: {
            type: String,
            required: true,
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (esperado YYYY-MM-DD)']
        },
        daysBefore: {
            type: Number,
            enum: [1, 3, 5],
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        read: {
            type: Boolean,
            default: false
        },
        dismissed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

NotificationSchema.index(
    { user: 1, task: 1, dueDate: 1, daysBefore: 1 },
    { unique: true }
);

const NotificationModel = mongoose.model('Notification', NotificationSchema);

export default NotificationModel;
