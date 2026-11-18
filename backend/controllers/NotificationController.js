import Notification from '../models/Notification.js';
import { formatDateString } from '../utils/utils.js';

class NotificationController {

    static async findAll(req, res) {
        try {
            const notifications = await Notification.findByUser(req.user.id);
            return res.status(200).json(notifications);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async generate(req, res) {
        try {
            const today = new Date();
            const overdueCount = await Notification.markOverdueTasksForUser(
                req.user.id,
                today
            );
            const notifications = await Notification.generateForUser(
                req.user.id,
                today,
                formatDateString
            );
            return res.status(200).json({ overdueCount, notifications });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async markAsRead(req, res) {
        try {
            const notification = await Notification.findById(req.params.id);
            if (!notification) {
                return res.status(404).json({ error: 'Notificação não encontrada' });
            }
            if (notification.user.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a esta notificação' });
            }
            const updated = await Notification.markAsRead(req.params.id);
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async dismiss(req, res) {
        try {
            const notification = await Notification.findById(req.params.id);
            if (!notification) {
                return res.status(404).json({ error: 'Notificação não encontrada' });
            }
            if (notification.user.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a esta notificação' });
            }
            await Notification.dismiss(req.params.id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default NotificationController;
