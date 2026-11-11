import User from '../models/User.js';

class UserController {

    static async create(req, res) {
        try {
            const { name, email, password, bio, productivityGoals, preferences } = req.body;
            const existing = await User.findByEmail(email);
            if (existing) {
                return res.status(409).json({ error: 'E-mail já cadastrado' });
            }

            const newUser = new User({ name, email, password, bio, productivityGoals, preferences });
            const saved = await newUser.save();
            const userResponse = saved.toObject();
            delete userResponse.password;

            return res.status(201).json(userResponse);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async findAll(req, res) {
        try {
            const users = await User.findAll();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async findById(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const updated = await User.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const deleted = await User.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            return res.status(200).json({ message: 'Usuário removido com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}

export default UserController;

