import { query } from '../db.js';

async function checkSchema() {
  try {
    console.log('--- daily_shop_items columns ---');
    const dsiCols = await query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'daily_shop_items'");
    console.table(dsiCols.rows);

    console.log('--- items columns ---');
    const itemCols = await query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'items'");
    console.table(itemCols.rows);

    console.log('--- daily_shop_items data (limit 5) ---');
    const dsiData = await query("SELECT * FROM daily_shop_items LIMIT 5");
    console.table(dsiData.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
