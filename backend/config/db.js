import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {

    static async connect() {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rotinas_db';
        const dbName = process.env.MONGO_INITDB_DATABASE || 'rotinas_db';

        try {
            const conn = await mongoose.connect(mongoUri, {
                dbName
            });
            console.log(`MongoDB conectado com sucesso: ${conn.connection.host} (Database: ${conn.connection.name})`);
            return conn;
        } catch (error) {
            // Caso o MongoDB local esteja rodando sem autenticação (ex: instalação padrão do MongoDB no Windows)
            if (error.message.includes('Authentication failed') || error.codeName === 'AuthenticationFailed') {
                try {
                    const fallbackUri = `mongodb://127.0.0.1:27017/${dbName}`;
                    const conn = await mongoose.connect(fallbackUri);
                    console.log(`MongoDB conectado (modo local sem auth): ${conn.connection.host} (Database: ${conn.connection.name})`);
                    return conn;
                } catch (fallbackError) {
                    console.error(`Erro ao conectar ao MongoDB: ${fallbackError.message}`);
                    process.exit(1);
                }
            }
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
