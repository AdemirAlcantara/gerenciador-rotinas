import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename));

const modelsPath = path.join(__dirname, 'models');
const assetsPath = path.join(__dirname, 'assets');
const logsPath = path.join(__dirname, 'logs');

function formatDateString(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTimeHHmm(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export {
    __dirname,
    modelsPath,
    assetsPath,
    logsPath,
    formatDateString,
    formatTimeHHmm
};
