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

    static async generateForUser(userId, currentDate, formatDate) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }

        const tasks = await TaskModel.find({
            user: userId,
            status: { $in: ['Pendente', 'Em Andamento'] }
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

        return Notification.findByUser(userId, formatDate(currentDate));
    }

    static async markOverdueTasksForUser(userId, currentDate) {
        const tasks = await TaskModel.find({
            user: userId,
            status: { $in: ['Pendente', 'Em Andamento'] }
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

    static async findByUser(userId, currentDateString = null) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }

        const query = { user: userId };
        if (currentDateString) {
            query.createdAt = { $gte: new Date(`${currentDateString}T00:00:00.000Z`) };
        }

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
}

export default Notification;
