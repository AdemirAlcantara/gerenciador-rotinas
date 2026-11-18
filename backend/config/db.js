import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { __dirname } from '../utils/utils.js';
import HabitCategoryModel from '../models/schemas/HabitCategorySchema.js';

dotenv.config({ path: path.join(__dirname, '.env') });

class Database {

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
                { routine: { $exists: true } },
                [
                    { $set: { habitCheckIn: '$routine' } },
                    { $unset: 'routine' }
                ]
            );

            await HabitCategoryModel.syncIndexes();

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
