import { rotateDailyShop } from './utils/shop_rotation.js';

const run = async () => {
  try {
    await rotateDailyShop();
    process.exit(0);
  } catch (err) {
    console.error('Manual rotation failed:', err);
    process.exit(1);
  }
};

run();
