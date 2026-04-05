import { query } from './db.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    await query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await query('INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)', ['user_test', 'Tester', 'test@example.com', hash]);
    console.log('User created: test@example.com / password123');
    process.exit(0);
  } catch (e) {
    console.error('FAILED:', e);
    process.exit(1);
  }
}

createTestUser();
