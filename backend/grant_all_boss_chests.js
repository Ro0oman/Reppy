import pool from './db.js';
import { autoGrantPendingChests } from './utils/bossRewards.js';

async function grantAllChests() {
  try {
    console.log('--- BUSCANDO COFRES PENDIENTES PARA TODOS LOS USUARIOS ---');
    const usersRes = await pool.query('SELECT id, name, email FROM users');
    const users = usersRes.rows;
    console.log(`Total de usuarios registrados: ${users.length}`);

    let totalChestsGranted = 0;
    let usersWithChests = 0;

    for (const user of users) {
      const chestsGranted = await autoGrantPendingChests(user.id);
      if (chestsGranted > 0) {
        console.log(`[OK] Entregados ${chestsGranted} cofres a: ${user.name} (${user.email})`);
        totalChestsGranted += chestsGranted;
        usersWithChests++;
      }
    }

    console.log('\n--- RESUMEN ---');
    console.log(`Total de cofres otorgados: ${totalChestsGranted}`);
    console.log(`Usuarios que recibieron cofres: ${usersWithChests}`);
    
    // Check Victor specifically just to be sure
    const victor = users.find(u => u.email === 'villarvictormyz@gmail.com');
    if (victor) {
      console.log(`\nEstado de Victor (villarvictormyz@gmail.com):`);
      const victorRes = await pool.query('SELECT boss_chests FROM users WHERE id = $1', [victor.id]);
      console.log(`Cofres actuales: ${victorRes.rows[0].boss_chests}`);
    } else {
      console.log('\nVictor (villarvictormyz@gmail.com) no fue encontrado en la base de datos.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error durante la ejecución del script global:', err);
    process.exit(1);
  }
}

grantAllChests();
