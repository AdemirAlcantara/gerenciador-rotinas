import express from 'express';
import dotenv from 'dotenv';
import {
    corsMiddleware,
    staticMiddleware,
    urlencodedMiddleware,
    jsonMiddleware,
    securityMiddleware,
    compressionMiddleware,
    rateLimitMiddleware,
    morganMiddleware
} from './middlewares/middlewares.js';
import router from './routes/router.js';
import Database from './config/db.js';

dotenv.config();

const app = express();

app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(rateLimitMiddleware);
app.use(morganMiddleware);
app.use(staticMiddleware);
app.use(urlencodedMiddleware);
app.use(jsonMiddleware);

// Suporta chamadas diretas (ex: /categories) e prefixadas com /api (ex: /api/categories)
app.use('/api', router);
app.use(router);

process.on('SIGINT', async () => {
    console.log('\nEncerrando o servidor...');
    await Database.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nServiço finalizado pelo sistema.');
    await Database.disconnect();
    process.exit(0);
});

const PORT = process.env.PORT;

async function startServer() {
    await Database.connect();
    app.listen(PORT, () => {
        console.log(`Servidor rodando: http://localhost:${PORT}`);
    });
}

startServer();
