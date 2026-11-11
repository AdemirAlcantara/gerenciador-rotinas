import express from 'express';
import { assetsPath, logsPath } from '../utils/utils.js';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';

if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath, { recursive: true });
}

const corsMiddleware = cors({ origin: '*'});
const staticMiddleware = express.static(assetsPath);
const urlencodedMiddleware = express.urlencoded({ extended: true });
const jsonMiddleware = express.json();
const securityMiddleware = helmet();
const compressionMiddleware = compression();
const rateLimitMiddleware = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições, tente novamente em 10 minutos.'
});

const logFile = fs.createWriteStream(path.join(logsPath, 'access.log'), { flags: 'a' });
const morganMiddleware = morgan('combined', { stream: logFile }); // registra requisições HTTP no arquivo de log

export {
    corsMiddleware,
    staticMiddleware,
    urlencodedMiddleware,
    jsonMiddleware,
    securityMiddleware,
    compressionMiddleware,
    rateLimitMiddleware,
    morganMiddleware
};
