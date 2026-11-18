import { Router } from 'express';
import HabitCategoryController from '../controllers/HabitCategoryController.js';
import HabitController from '../controllers/HabitController.js';
import UserController from '../controllers/UserController.js';
import HabitCheckInController from '../controllers/HabitCheckInController.js';
import TaskController from '../controllers/TaskController.js';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import NotificationController from '../controllers/NotificationController.js';
import DashboardController from '../controllers/DashboardController.js';

const router = Router();

// Rota de verificação de status da API
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API Gerenciador de Check-ins operando normalmente.' });
});

// Authentication
router.post('/auth/login', AuthController.login);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/reset-password', AuthController.resetPassword);
router.put('/auth/password', authMiddleware, AuthController.changePassword);

// Registration remains public.
router.post('/users', UserController.create);

router.use(authMiddleware);

// Dashboard
router.get('/dashboard/stats', DashboardController.getStats);
router.post('/dashboard/ai-analysis', DashboardController.getAiAnalysis);

// Current user
router.get('/users/me', UserController.findCurrent);
router.put('/users/me', UserController.updateCurrent);

// HabitCategory
router.post('/habit-categories', HabitCategoryController.create);
router.get('/habit-categories', HabitCategoryController.findAll);
router.get('/habit-categories/:id', HabitCategoryController.findById);
router.put('/habit-categories/:id', HabitCategoryController.update);
router.delete('/habit-categories/:id', HabitCategoryController.delete);

// Habit
router.post('/habits', HabitController.create);
router.get('/habits', HabitController.findAll);
router.get('/habits/:id', HabitController.findById);
router.put('/habits/:id', HabitController.update);
router.delete('/habits/:id', HabitController.delete);

// Habit check-ins
router.post('/habit-check-ins/generate-daily', HabitCheckInController.generateDaily);
router.post('/habit-check-ins', HabitCheckInController.create);
router.get('/habit-check-ins', HabitCheckInController.findAll);
router.get('/habit-check-ins/:id', HabitCheckInController.findById);
router.put('/habit-check-ins/:id', HabitCheckInController.update);
router.delete('/habit-check-ins/:id', HabitCheckInController.delete);

// Task
router.post('/tasks', TaskController.create);
router.get('/tasks', TaskController.findAll);
router.get('/tasks/:id', TaskController.findById);
router.put('/tasks/:id', TaskController.update);
router.delete('/tasks/:id', TaskController.delete);

// Notifications
router.post('/notifications/generate', NotificationController.generate);
router.get('/notifications', NotificationController.findAll);
router.patch('/notifications/:id/read', NotificationController.markAsRead);
router.patch('/notifications/:id/dismiss', NotificationController.dismiss);

export default router;

