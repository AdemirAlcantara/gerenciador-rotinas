import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { __dirname } from '../utils/utils.js';

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

            // Garante que o banco rotinas_db seja materializado imediatamente no MongoDB (visível no Compass / show dbs)
            const collections = await conn.connection.db.listCollections().toArray();
            if (collections.length === 0) {
                await conn.connection.db.createCollection('habitcategories');
            }

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
