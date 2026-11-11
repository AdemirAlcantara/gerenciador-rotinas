import { Router } from 'express';
import HabitCategoryController from '../controllers/HabitCategoryController.js';
import HabitController from '../controllers/HabitController.js';
import UserController from '../controllers/UserController.js';
import RoutineController from '../controllers/RoutineController.js';
import TaskController from '../controllers/TaskController.js';

const router = Router();

// Rota de verificação de status da API
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API Gerenciador de Rotinas operando normalmente.' });
});

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

// User
router.post('/users', UserController.create);
router.get('/users', UserController.findAll);
router.get('/users/:id', UserController.findById);
router.put('/users/:id', UserController.update);
router.delete('/users/:id', UserController.delete);

// Routine
router.post('/routines', RoutineController.create);
router.get('/routines', RoutineController.findAll);
router.get('/routines/:id', RoutineController.findById);
router.put('/routines/:id', RoutineController.update);
router.delete('/routines/:id', RoutineController.delete);

// Task
router.post('/tasks', TaskController.create);
router.get('/tasks', TaskController.findAll);
router.get('/tasks/:id', TaskController.findById);
router.put('/tasks/:id', TaskController.update);
router.delete('/tasks/:id', TaskController.delete);

export default router;

