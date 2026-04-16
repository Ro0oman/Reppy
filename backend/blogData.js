import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'blogData.json');
const jsonData = fs.readFileSync(jsonPath, 'utf8');

export const blogData = JSON.parse(jsonData);
