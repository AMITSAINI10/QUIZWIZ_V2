import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseFile = process.env.DATABASE_URL || path.join(__dirname, '../../data/quizwiz.db');
fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
const db = new Database(databaseFile);

db.pragma('journal_mode = WAL');

export default db;

