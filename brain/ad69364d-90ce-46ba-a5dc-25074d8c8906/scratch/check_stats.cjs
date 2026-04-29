const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.pjxaqeeealtcbfaxcuuk:reppypasswordreppy@aws-1-eu-west-1.pooler.supabase.com:6543/postgres' });

client.connect()
  .then(() => client.query("SELECT name, stats FROM items WHERE name IN ('Túnica del Nether', 'Peto del Ender Dragon', 'Elixir de Resistencia')"))
  .then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
