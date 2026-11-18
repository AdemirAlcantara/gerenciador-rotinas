import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { __dirname } from '../utils/utils.js';
import HabitCategoryModel from '../models/schemas/HabitCategorySchema.js';
import HabitModel from '../models/schemas/HabitSchema.js';
import HabitCheckInModel from '../models/schemas/HabitCheckInSchema.js';
import TaskModel from '../models/schemas/TaskSchema.js';

dotenv.config({ path: path.join(__dirname, '.env') });

class Database {

    static async migrateOrphanedOwnership(db) {
        const users = await db.collection('users').find(
            {},
            { projection: { _id: 1 } }
        ).toArray();

        const collections = ['habitcategories', 'habits', 'habitcheckins', 'tasks'];
        for (const collectionName of collections) {
            const collection = db.collection(collectionName);
            const orphanFilter = {
                $or: [
                    { user: { $exists: false } },
                    { user: null }
                ]
            };
            const orphans = await collection.find(orphanFilter).toArray();

            if (!orphans.length) continue;

            if (users.length === 1) {
                await collection.updateMany(
                    orphanFilter,
                    { $set: { user: users[0]._id } }
                );
                console.log(`Migrados ${orphans.length} registro(s) sem dono para o único usuário em ${collectionName}.`);
                continue;
            }

            const quarantineName = `${collectionName}_unowned`;
            if (orphans.length) {
                await db.collection(quarantineName).insertMany(orphans);
                await collection.deleteMany(
                    { _id: { $in: orphans.map((record) => record._id) } }
                );
                console.log(`Isolados ${orphans.length} registro(s) sem dono em ${quarantineName}.`);
            }
        }
    }

    static async connect() {
        const mongoUri = process.env.MONGO_URI;
        const dbName = process.env.MONGO_INITDB_DATABASE;

        if (!mongoUri) {
            console.error('Erro: A variável MONGO_URI não está definida no arquivo .env');
            process.exit(1);
        }

        try {
            const conn = await mongoose.connect(mongoUri, {
                dbName,
                serverSelectionTimeoutMS: 5000
            });

            const collections = await conn.connection.db.listCollections().toArray();
            if (collections.length === 0) {
                await conn.connection.db.createCollection('habitcategories');
            }

            const collectionNames = collections.map((collection) => collection.name);
            if (collectionNames.includes('routines') && !collectionNames.includes('habitcheckins')) {
                await conn.connection.db.collection('routines').rename('habitcheckins');
            }
            await conn.connection.db.collection('tasks').updateMany(
                {},
                [
                    { $unset: ['timeBlock', 'startTime', 'endTime', 'habitCheckIn', 'routine'] }
                ]
            );

            await this.migrateOrphanedOwnership(conn.connection.db);
            await HabitCategoryModel.syncIndexes();
            await HabitModel.syncIndexes();
            await HabitCheckInModel.syncIndexes();
            await TaskModel.syncIndexes();

            console.log(`MongoDB conectado com sucesso: ${conn.connection.host} (Database: ${conn.connection.name})`);
            return conn;
        } catch (error) {
            console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
            process.exit(1);
        }
    }

    static async disconnect() {
        try {
            await mongoose.disconnect();
            console.log('Conexão com o MongoDB encerrada.');
        } catch (error) {
            console.error(`Erro ao desconectar do MongoDB: ${error.message}`);
        }
    }

}

export default Database;
