import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HabitCheckIn from '../models/HabitCheckIn.js';
import { formatDateString } from '../utils/utils.js';

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('A variável JWT_SECRET não está definida no arquivo .env');
    }
    return process.env.JWT_SECRET;
};

const isBcryptHash = (value) => typeof value === 'string' && value.startsWith('$2');

class AuthController {

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findByEmail(email);

            if (!user || !password) {
                return res.status(401).json({ error: 'E-mail ou senha inválidos' });
            }

            let validPassword = false;
            if (isBcryptHash(user.password)) {
                validPassword = await bcrypt.compare(password, user.password);
            } else {
                validPassword = user.password === password;
                if (validPassword) {
                    user.password = await bcrypt.hash(password, 12);
                    await user.save();
                }
            }

            if (!validPassword) {
                return res.status(401).json({ error: 'E-mail ou senha inválidos' });
            }

            const today = formatDateString(new Date());
            let dailyCheckIns = null;
            if (user.lastHabitCheckInGeneratedDate !== today) {
                try {
                    dailyCheckIns = await HabitCheckIn.generateDailyForUser(user._id, new Date());
                    await User.updateLastHabitCheckInGeneratedDate(user._id, today);
                    user.lastHabitCheckInGeneratedDate = today;
                } catch (error) {
                    console.error('Erro ao gerar check-ins diários no login:', error.message);
                }
            } else {
                dailyCheckIns = {
                    dateString: today,
                    createdCount: 0,
                    alreadyGenerated: true,
                    totalForDay: (await HabitCheckIn.findByDate(today, user._id)).length
                };
            }

            const token = jwt.sign({ id: user._id.toString() }, getJwtSecret(), { expiresIn: '8h' });
            const userResponse = user.toObject();
            delete userResponse.password;

            return res.status(200).json({ token, user: userResponse, dailyCheckIns });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    error: 'A senha atual e uma nova senha são obrigatórias'
                });
            }

            const user = await User.findByIdWithPassword(req.user.id);
            if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
                return res.status(401).json({ error: 'Senha atual inválida' });
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({ error: 'A nova senha deve ser diferente da senha atual' });
            }

            const passwordHash = await bcrypt.hash(newPassword, 12);
            await User.updatePassword(user._id, passwordHash);
            return res.status(200).json({ message: 'Senha alterada com sucesso' });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

}

export default AuthController;
