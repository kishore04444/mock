/**
 * Load .env from server directory BEFORE any other imports.
 * Import this first in server.js so OPENAI_API_KEY is available when openaiService loads.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
