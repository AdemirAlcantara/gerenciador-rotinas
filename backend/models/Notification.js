import mongoose from 'mongoose';
import NotificationModel from './schemas/NotificationSchema.js';
import TaskModel from './schemas/TaskSchema.js';

const notificationDaysByPriority = {
    Alta: [5, 3, 1],
    Média: [3, 1],
    Baixa: [1]
};

const dateDifferenceInDays = (dueDate, currentDate) => {
    const [dueYear, dueMonth, dueDay] = dueDate.split('-').map(Number);
    const current = new Date(currentDate);
    const currentUtc = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
    const dueUtc = Date.UTC(dueYear, dueMonth - 1, dueDay);
    return Math.round((dueUtc - currentUtc) / 86400000);
};

const formatMessage = (task, daysBefore) => {
    const dayLabel = daysBefore === 1 ? 'dia' : 'dias';
    return `A tarefa "${task.title}" vence em ${daysBefore} ${dayLabel}.`;
};

class Notification {

    static async syncForTask(task, currentDate = new Date()) {
        if (!task || !task._id || !task.user) {
            return [];
        }

        const userId = task.user._id || task.user;
        const terminalStatuses = ['Concluída', 'Cancelada', 'Não realizada'];

        if (terminalStatuses.includes(task.status)) {
            await NotificationModel.deleteMany({ task: task._id });
            return [];
        }

        const daysUntilDue = dateDifferenceInDays(task.dueDate, currentDate);
        if (daysUntilDue < 0) {
            await TaskModel.findByIdAndUpdate(task._id, { status: 'Não realizada' });
            task.status = 'Não realizada';
            await NotificationModel.deleteMany({ task: task._id });
            return [];
        }

        const notificationDays = notificationDaysByPriority[task.priority] || [];
        await NotificationModel.deleteMany({
            task: task._id,
            $or: [
                { dueDate: { $ne: task.dueDate } },
                { daysBefore: { $nin: notificationDays } }
            ]
        });

        const existingNotifications = await NotificationModel.find({ task: task._id });
        await Promise.all(existingNotifications.map((notification) =>
            NotificationModel.findByIdAndUpdate(notification._id, {
                message: formatMessage(task, notification.daysBefore)
            })
        ));

        if (!notificationDays.includes(daysUntilDue)) {
            return Notification.findByUser(userId);
        }

        await NotificationModel.updateMany(
            { task: task._id, dueDate: task.dueDate, daysBefore: daysUntilDue },
            { $set: { message: formatMessage(task, daysUntilDue) } }
        );

        await NotificationModel.updateOne(
            {
                user: userId,
                task: task._id,
                dueDate: task.dueDate,
                daysBefore: daysUntilDue
            },
            {
                $setOnInsert: {
                    user: userId,
                    task: task._id,
                    dueDate: task.dueDate,
                    daysBefore: daysUntilDue,
                    message: formatMessage(task, daysUntilDue),
                    read: false
                }
            },
            { upsert: true }
        );

        return Notification.findByUser(userId);
    }

    static async deleteForTask(taskId) {
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return 0;
        }
        const result = await NotificationModel.deleteMany({ task: taskId });
        return result.deletedCount || 0;
    }

    static async generateForUser(userId, currentDate, formatDate) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }

        const tasks = await TaskModel.find({
            user: userId,
            status: 'Pendente'
        });
        const operations = [];

        for (const task of tasks) {
            const daysUntilDue = dateDifferenceInDays(task.dueDate, currentDate);
            const notificationDays = notificationDaysByPriority[task.priority] || [];
            if (!notificationDays.includes(daysUntilDue)) {
                continue;
            }

            operations.push({
                updateOne: {
                    filter: {
                        user: task.user,
                        task: task._id,
                        dueDate: task.dueDate,
                        daysBefore: daysUntilDue
                    },
                    update: {
                        $setOnInsert: {
                            user: task.user,
                            task: task._id,
                            dueDate: task.dueDate,
                            daysBefore: daysUntilDue,
                            message: formatMessage(task, daysUntilDue),
                            read: false
                        }
                    },
                    upsert: true
                }
            });
        }

        if (operations.length) {
            await NotificationModel.bulkWrite(operations, { ordered: false });
        }

        return Notification.findByUser(userId);
    }

    static async markOverdueTasksForUser(userId, currentDate) {
        const tasks = await TaskModel.find({
            user: userId,
            status: 'Pendente'
        });
        const overdueIds = tasks
            .filter((task) => dateDifferenceInDays(task.dueDate, currentDate) < 0)
            .map((task) => task._id);

        if (overdueIds.length) {
            await TaskModel.updateMany(
                { _id: { $in: overdueIds }, user: userId },
                { $set: { status: 'Não realizada' } }
            );
        }

        return overdueIds.length;
    }

    static async findByUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }

        const query = { user: userId, dismissed: { $ne: true } };
        return await NotificationModel.find(query)
            .populate('task')
            .sort({ read: 1, createdAt: -1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await NotificationModel.findById(id).populate('task');
    }

    static async markAsRead(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await NotificationModel.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        ).populate('task');
    }

    static async dismiss(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await NotificationModel.findByIdAndUpdate(
            id,
            { dismissed: true },
            { new: true }
        ).populate('task');
    }
}

export default Notification;
