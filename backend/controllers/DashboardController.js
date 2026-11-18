import HabitCheckIn from '../models/HabitCheckIn.js';
import Task from '../models/Task.js';
import { analyzeRoutine } from '../services/geminiService.js';

const formatDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const percentage = (completed, total) =>
    total === 0 ? 0 : Math.round((completed / total) * 100);

class DashboardController {
    static async getStats(req, res) {
        try {
            const today = new Date();
            const periodStart = new Date(today);
            periodStart.setDate(periodStart.getDate() - 29);
            const periodStartString = formatDateInput(periodStart);

            const [checkIns, tasks] = await Promise.all([
                HabitCheckIn.findByUser(req.user.id),
                Task.findByUser(req.user.id)
            ]);

            const periodCheckIns = checkIns.filter((checkIn) =>
                checkIn.dateString && checkIn.dateString >= periodStartString
            );
            const completedCheckIns = periodCheckIns.filter((checkIn) =>
                checkIn.status === 'Concluído'
            ).length;
            const habitFidelity = percentage(completedCheckIns, periodCheckIns.length);

            const eligibleTasks = tasks.filter((task) => task.status !== 'Cancelada');
            const completedOnTimeTasks = eligibleTasks.filter((task) => {
                if (task.status !== 'Concluída' || !task.updatedAt) {
                    return false;
                }

                const deadline = `${task.dueDate}T${task.targetTime || '23:59'}:59`;
                return new Date(task.updatedAt).getTime() <= new Date(deadline).getTime();
            }).length;
            const taskFidelity = percentage(completedOnTimeTasks, eligibleTasks.length);

            const availableFidelities = [
                periodCheckIns.length ? habitFidelity : null,
                eligibleTasks.length ? taskFidelity : null
            ].filter((value) => value !== null);
            const overallFidelity = availableFidelities.length
                ? Math.round(availableFidelities.reduce((sum, value) => sum + value, 0) / availableFidelities.length)
                : 0;

            return res.status(200).json({
                periodStart: periodStartString,
                periodEnd: formatDateInput(today),
                habitFidelity,
                taskFidelity,
                overallFidelity,
                totals: {
                    checkIns: periodCheckIns.length,
                    completedCheckIns,
                    tasks: eligibleTasks.length,
                    completedOnTimeTasks
                }
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getAiAnalysis(req, res) {
        try {
            const today = new Date();
            const periodStart = new Date(today);
            periodStart.setDate(periodStart.getDate() - 29);
            const periodStartString = formatDateInput(periodStart);

            const [checkIns, tasks] = await Promise.all([
                HabitCheckIn.findByUser(req.user.id),
                Task.findByUser(req.user.id)
            ]);

            const periodCheckIns = checkIns
                .filter((checkIn) => checkIn.dateString && checkIn.dateString >= periodStartString)
                .map((checkIn) => ({
                    date: checkIn.dateString,
                    habit: checkIn.habit?.habit || 'Hábito removido',
                    status: checkIn.status,
                    mood: checkIn.mood || null,
                    notes: checkIn.notes || ''
                }));

            const eligibleTasks = tasks
                .filter((task) => task.status !== 'Cancelada')
                .map((task) => ({
                    title: task.title,
                    dueDate: task.dueDate,
                    targetTime: task.targetTime || null,
                    status: task.status,
                    priority: task.priority,
                    updatedAt: task.updatedAt || null
                }));

            const statsResponse = DashboardController.buildStats(periodCheckIns, eligibleTasks);

            const analysis = await analyzeRoutine({
                period: { start: periodStartString, end: formatDateInput(today) },
                stats: statsResponse,
                checkIns: periodCheckIns,
                tasks: eligibleTasks
            });

            return res.status(200).json(analysis);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static buildStats(periodCheckIns, eligibleTasks) {
        const completedCheckIns = periodCheckIns.filter((checkIn) =>
            checkIn.status === 'Concluído'
        ).length;
        const habitFidelity = percentage(completedCheckIns, periodCheckIns.length);

        const completedOnTimeTasks = eligibleTasks.filter((task) => {
            if (task.status !== 'Concluída' || !task.updatedAt) {
                return false;
            }
            const deadline = `${task.dueDate}T${task.targetTime || '23:59'}:59`;
            return new Date(task.updatedAt).getTime() <= new Date(deadline).getTime();
        }).length;
        const taskFidelity = percentage(completedOnTimeTasks, eligibleTasks.length);
        const availableFidelities = [
            periodCheckIns.length ? habitFidelity : null,
            eligibleTasks.length ? taskFidelity : null
        ].filter((value) => value !== null);
        const overallFidelity = availableFidelities.length
            ? Math.round(availableFidelities.reduce((sum, value) => sum + value, 0) / availableFidelities.length)
            : 0;

        return { habitFidelity, taskFidelity, overallFidelity };
    }
}

export default DashboardController;
