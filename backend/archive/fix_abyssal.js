import { query } from './db.js';
query("UPDATE items SET svg_key = 'gi:cultist' WHERE id = 119").then(() => process.exit(0));
