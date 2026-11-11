import HabitCategory from '../models/HabitCategory.js';

class HabitCategoryController {

    static async create(req, res) {
        try {
            const { category, descripition, description } = req.body;
            const newCategory = new HabitCategory({
                category,
                descripition: descripition ?? description
            });
            const saved = await newCategory.save();
            return res.status(201).json(saved);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const categories = await HabitCategory.findAll();
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
            return res.status(200).json(category);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
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

