import { test, expect } from '@playwright/test';
import axios from 'axios';

const BASE_URL = 'http://localhost:5173';

const getTestUser = () => {
  const id = Math.floor(Math.random() * 10000);
  return {
    name: `SHOP_TEST_${id}`,
    email: `shop_test_${id}_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };
};

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Daily Shop & Premium Chests Verification (#124)', () => {
  let currentUser;

  test.beforeEach(async ({ page }) => {
    currentUser = getTestUser();
    
    // Register
    await page.goto('/es/login');
    const signupBtn = page.locator('button:has-text("Registrarse")').first();
    await signupBtn.click();
    
    await page.locator('input[type="text"]').fill(currentUser.name);
    await page.locator('input[type="email"]').fill(currentUser.email);
    await page.locator('input[type="password"]').fill(currentUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for the URL to change (any page after login)
    await page.waitForFunction(() => localStorage.getItem('token'), { timeout: 15000 });
    
    // Get the real user ID from localStorage
    const realUserId = await page.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.id;
    });

    console.log(`Real User ID: ${realUserId}`);
    
    // Fund User via Test API
    await page.evaluate(async (userId) => {
      const token = localStorage.getItem('token');
      await fetch('/api/test/add-coins', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: 50000 })
      });
      await fetch('/api/test/add-gems', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: 500 })
      });
    }, realUserId);

    // Verify Funding
    await page.goto('/es/shop');
    await page.waitForLoadState('networkidle');
    const coins = page.locator('[data-testid="reppy-coins"]');
    await expect(coins).toContainText(/50000|49999/, { timeout: 15000 }); // Large amount
    console.log('User funding verified.');
  });

  test('should handle daily shop purchase, chest acquisition and reroll', async ({ page }) => {
    // Navigate to Shop
    await page.goto('/es/shop');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for animations and store fetch

    // 1. Verify Mercader del Día (Daily Merchant) visibility
    console.log('Verifying Mercader del Día visibility...');
    await expect(page.locator('text=/MERCADER DEL DÍA|DAILY MERCHANT/i').first()).toBeVisible({ timeout: 20000 });
    
    // Wait for cards to appear anywhere in the shop
    console.log('Waiting for shop cards...');
    const cards = page.locator('.daily-deals-grid .group');
    await expect(cards.first()).toBeVisible({ timeout: 20000 });
    
    const count = await cards.count();
    console.log(`Verified ${count} shop slots.`);
    await expect(cards).toHaveCount(6);
    
    // 2. Buy a Daily Deal Item
    console.log('Attempting to buy daily deal...');
    const dailyDealCard = cards.first();
    const buyBtn = dailyDealCard.locator('button:has-text("OBTENER"), button:has-text("GET"), button:has-text("COMPRAR")');
    await expect(buyBtn).toBeVisible({ timeout: 10000 });
    
    // Wait for the purchase response
    const purchasePromise = page.waitForResponse(resp => resp.url().includes('/api/shop/buy') && resp.status() === 200);
    await buyBtn.click();
    await purchasePromise;
    
    // Verify purchase success by checking the card state
    await expect(dailyDealCard.locator('text=/ADQUIRIDO|ACQUIRED/i').first()).toBeVisible({ timeout: 15000 });
    console.log('Daily deal purchase verified via card state.');

    // 3. Reroll the shop
    console.log('Testing reroll...');
    const initialFirstItemName = await dailyDealCard.locator('h3').textContent();
    const refreshBtn = page.locator('button').filter({ hasText: /REFRESCAR|REFRESH/i }).first();
    
    await refreshBtn.click();
    await page.waitForResponse(resp => resp.url().includes('/api/shop/daily/refresh') && resp.status() === 200);
    await page.waitForTimeout(2000); // Wait for update
    
    const newFirstItemName = await cards.first().locator('h3').textContent();
    console.log(`Reroll: ${initialFirstItemName} -> ${newFirstItemName}`);
    
    // 4. Equip an item from the card
    console.log('Attempting to buy and equip...');
    const buyBtn2 = cards.first().locator('button:has-text("OBTENER"), button:has-text("GET"), button:has-text("COMPRAR")');
    await buyBtn2.click();
    await page.waitForResponse(resp => resp.url().includes('/api/shop/buy') && resp.status() === 200);
    
    const equipBtn = cards.first().locator('button:has-text("EQUIPAR"), button:has-text("EQUIP")');
    await expect(equipBtn).toBeVisible({ timeout: 10000 });
    
    const equipPromise = page.waitForResponse(resp => resp.url().includes('/api/shop/equip') && resp.status() === 200);
    await equipBtn.click();
    await equipPromise;
    
    // Check for "ACTIVO" or "ON" text on the card/button
    await expect(cards.first().locator('button:has-text("ACTIVO"), button:has-text("ON")')).toBeVisible({ timeout: 10000 });
    console.log('Daily deal equipment verified.');
    
    // 5. Buy a Premium Chest
    await expect(page.locator('text=/COFRES PREMIUM|PREMIUM CHESTS/i')).toBeVisible();
    const chestCard = page.locator('.group').filter({ hasText: /COFRE LEGENDARIO|LEGENDARY CHEST/i }).first();
    const getChestBtn = chestCard.locator('button:has-text("OBTENER"), button:has-text("GET")');
    await getChestBtn.click();
    await expect(page.locator('text=/CHEST ACQUIRED|COFRE ADQUIRIDO/i').first()).toBeVisible({ timeout: 10000 });
    console.log('Premium chest purchase verified.');

    // 6. Verify tab restriction (Mercader del Día should NOT be in Cosmetics tab)
    await page.click('button:has-text("COSMÉTICOS"), button:has-text("COSMETICS")');
    await expect(page.locator('text=/MERCADER DEL DÍA|DAILY MERCHANT/i')).not.toBeVisible();
    console.log('Tab visibility restriction verified.');
  });
});
