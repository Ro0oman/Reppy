const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run('UPDATE cosmetics SET price = 1111 WHERE name = "Carbon Scan"');
  db.run('UPDATE cosmetics SET price = 2222 WHERE name = "Neon Pulse"');
  db.run('UPDATE cosmetics SET price = 3333 WHERE name = "Matrix Rain"');
  db.run('UPDATE cosmetics SET price = 4444 WHERE name = "Inferno Core"');
  db.run('UPDATE cosmetics SET price = 5555 WHERE name = "Void Gravity"');
  console.log('Prices updated successfully');
});

db.close();
