const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.pjxaqeeealtcbfaxcuuk:reppypasswordreppy@aws-1-eu-west-1.pooler.supabase.com:6543/postgres' });

client.connect()
  .then(() => client.query('SELECT * FROM items LIMIT 1'))
  .then(res => {
    console.log('COLUMNS:', Object.keys(res.rows[0]).join(', '));
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
