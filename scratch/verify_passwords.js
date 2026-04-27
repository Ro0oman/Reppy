import { query } from '../backend/db.js';
import bcrypt from 'bcryptjs';

async function verifyPasswords() {
  try {
    const emails = ['test_a@reppy.com', 'test_b@reppy.com', 'test@example.com'];
    const password = 'password123';
    
    for (const email of emails) {
      const res = await query('SELECT password_hash FROM users WHERE email = $1', [email]);
      if (res.rows.length > 0 && res.rows[0].password_hash) {
        const isValid = await bcrypt.compare(password, res.rows[0].password_hash);
        console.log(`Email: ${email} | Password 'password123' is ${isValid ? 'VALID' : 'INVALID'}`);
      } else {
        console.log(`Email: ${email} | User not found or no password hash (Google account?)`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyPasswords();
