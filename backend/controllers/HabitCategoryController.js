import HabitCategory from '../models/HabitCategory.js';

class HabitCategoryController {

    static async create(req, res) {
        try {
            const { category, descripition, description } = req.body;
            const newCategory = new HabitCategory({
                category,
                descripition: descripition ?? description,
                user: req.user.id
            });
            const saved = await newCategory.save();
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const categories = await HabitCategory.findAll(req.user.id);
            return res.status(200).json(categories);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async findById(req, res) {
        try {
            const category = await HabitCategory.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }
            if ((category.user?._id || category.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a esta categoria' });
            }
            return res.status(200).json(category);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const existing = await HabitCategory.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a esta categoria' });
            }
            const { category, descripition, description } = req.body;
            const updated = await HabitCategory.update(req.params.id, {
                category,
                descripition: descripition ?? description
            });
            if (!updated) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const existing = await HabitCategory.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }
            if ((existing.user?._id || existing.user)?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado a esta categoria' });
            }
            const deleted = await HabitCategory.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }
            return res.status(200).json({ message: 'Categoria removida com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}

export default HabitCategoryController;

