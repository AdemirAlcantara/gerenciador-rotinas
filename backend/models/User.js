import mongoose from 'mongoose';
import UserModel from './schemas/UserSchema.js';

class User {

    constructor({ name, email, password, bio, productivityGoals, preferences, lastHabitCheckInGeneratedDate }) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.bio = bio;
        this.productivityGoals = productivityGoals;
        this.preferences = preferences;
        this.lastHabitCheckInGeneratedDate = lastHabitCheckInGeneratedDate || null;
    }

    async save() {
        const newUser = new UserModel({
            name: this.name,
            email: this.email,
            password: this.password,
            bio: this.bio,
            productivityGoals: this.productivityGoals,
            preferences: this.preferences,
            lastHabitCheckInGeneratedDate: this.lastHabitCheckInGeneratedDate
        });

        return await newUser.save();
    }

    static async findAll() {
        return await UserModel.find()
            .select('-password')
            .sort({ name: 1 });
    }

    static async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await UserModel.findById(id).select('-password');
    }

    static async findByIdWithPassword(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await UserModel.findById(id);
    }

    static async findByEmail(email) {
        return await UserModel.findOne({ email: email?.toLowerCase()?.trim() });
    }

    static async update(id, { name, email, password, bio, productivityGoals, preferences }) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const updateData = { name, email, bio, productivityGoals, preferences };
        if (password !== undefined) {
            updateData.password = password;
        }

        return await UserModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
    }

    static async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await UserModel.findByIdAndDelete(id).select('-password');
    }

    static async updatePassword(id, password) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await UserModel.findByIdAndUpdate(id, { password }, { new: true }).select('-password');
    }

    static async updateLastHabitCheckInGeneratedDate(id, dateString) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await UserModel.findByIdAndUpdate(
            id,
            { lastHabitCheckInGeneratedDate: dateString },
            { new: true, runValidators: true }
        ).select('-password');
    }

}

export default User;
