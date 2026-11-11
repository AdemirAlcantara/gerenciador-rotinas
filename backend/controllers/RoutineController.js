import Routine from '../models/Routine.js';

class RoutineController {

    static async create(req, res) {
        try {
            const { date, habit, user, category, status, completedAt, mood, energyLevel, notes } = req.body;
            const newRoutine = new Routine({
                date,
                habit,
                user,
                category,
                status,
                completedAt,
                mood,
                energyLevel,
                notes
            });
            const saved = await newRoutine.save();
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const { date, user, status } = req.query;
            let routines;

            if (date) {
                routines = await Routine.findByDate(date);
            } else if (user) {
                routines = await Routine.findByUser(user);
            } else if (status) {
                routines = await Routine.findByStatus(status);
            } else {
                routines = await Routine.findAll();
            }

            return res.status(200).json(routines);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async findById(req, res) {
        try {
            const routine = await Routine.findById(req.params.id);
            if (!routine) {
                return res.status(404).json({ error: 'Registro de rotina não encontrado' });
            }
            return res.status(200).json(routine);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const updated = await Routine.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Registro de rotina não encontrado' });
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const deleted = await Routine.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Registro de rotina não encontrado' });
            }
            return res.status(200).json({ message: 'Registro de rotina removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}

export default RoutineController;

