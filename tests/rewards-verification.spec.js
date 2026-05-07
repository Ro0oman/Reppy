import { test, expect } from '@playwright/test';

const getTestUser = () => {
  const id = Math.floor(Math.random() * 10000);
  return {
    name: `REWARD_TEST_${id}`,
    email: `reward_test_${id}_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };
};

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Automated Rewards & Shop Verification', () => {
  let currentUser;

  test.beforeEach(async ({ page }) => {
    currentUser = getTestUser();
    console.log(`Setting up test user: ${currentUser.name}`);
    
    // Register via UI
    await page.goto('/es/login');
    const signupBtn = page.locator('button:has-text("Registrarse"), button:has-text("Sign Up")').first();
    await signupBtn.click();
    
    await page.locator('input[type="text"]').fill(currentUser.name);
    await page.locator('input[type="email"]').fill(currentUser.email);
    await page.locator('input[type="password"]').fill(currentUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });
    
    // Handle overhaul modals
    try {
      await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
      for (let i = 0; i < 5; i++) {
        const dialog = page.locator('div[role="dialog"]').last();
        if (await dialog.isVisible({ timeout: 1000 })) {
          const btn = dialog.locator('button:has-text("CERRAR"), button:has-text("COMPRENDIDO"), button:has-text("OK")').last();
          await btn.click({ force: true });
          await page.waitForTimeout(500);
        } else break;
      }
    } catch (e) {}
  });

  test('should open level and boss chests', async ({ page }) => {
    console.log('Granting chests via test API...');
    const result = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/test/add-chests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ boss: 1, level: 1 })
      });
      return { status: res.status, ok: res.ok };
    });
    console.log(`Grant chests status: ${result.status} (OK: ${result.ok})`);
    
    await page.waitForTimeout(1000); // Wait for DB sync
    console.log('Refreshing to ensure chests are detected...');
    await page.reload();
    await page.goto('/es/inventory');
    await page.waitForLoadState('networkidle');
    
    // 1. Verify Level Chest Presence & Open
    console.log('Opening Level Chest...');
    await page.waitForTimeout(2000); // Allow translations to hydrate
    
    const levelChest = page.getByText(/Módulo|Evolution/i).first();
    await expect(levelChest).toBeVisible({ timeout: 15000 });
    await levelChest.click();
    
    // Wait for "DECRYPTION PROTOCOL" text (Legacy mode)
    await expect(page.getByText(/DECRYPTION SYSTEM/i)).toBeVisible({ timeout: 10000 });
    
    // Wait for "COLLECT" button
    const collectAssetBtn = page.getByRole('button', { name: /COLLECT|COLECTAR/i }).first();
    await expect(collectAssetBtn).toBeVisible({ timeout: 20000 });
    await collectAssetBtn.click();
    
    // 2. Verify Boss Chest Presence & Open
    console.log('Opening Boss Chest...');
    const bossChest = page.getByText(/Desencriptado|Decrypted/i).first();
    await expect(bossChest).toBeVisible();
    await bossChest.click();
    
    // Boss chest uses "Clash" mode. We need to click to "TAP TO OPEN" then "reveal".
    await expect(page.locator('text=/TAP TO OPEN/i')).toBeVisible({ timeout: 10000 });
    await page.click('text=/TAP TO OPEN/i');
    
    const collectLootBtn = page.locator('button:has-text("COLECTAR BOTÍN"), button:has-text("COLLECT LOOT")').first();
    // Simulate clicks to reveal rewards
    for(let i=0; i<5; i++) {
      if (await collectLootBtn.isVisible()) break;
      await page.click('body');
      await page.waitForTimeout(500);
    }
    
    await expect(collectLootBtn).toBeVisible({ timeout: 10000 });
    await collectLootBtn.click();
    
    console.log('All chests opened successfully!');
  });

  test('should purchase a bundle and receive multiple items', async ({ page }) => {
    console.log('Granting coins via test API...');
    await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      await fetch('/api/test/add-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: 10000 })
      });
    });

    await page.goto('/es/shop');
    
    // Select Bundles category
    const bundleTab = page.locator('button:has-text("Packs"), button:has-text("Bundles")').first();
    await bundleTab.click();
    
    // Look for a purchase button on a bundle card
    const bundleCard = page.locator('.shop-card, div:has-text("Pack")').filter({ hasText: /Coins/i }).first();
    const buyButton = bundleCard.locator('button:has-text("COINS")').first();
    
    console.log('Purchasing bundle...');
    await buyButton.click();
    
    // Modal confirmation
    const confirmBtn = page.locator('button:has-text("CONFIRMAR"), button:has-text("COMPRAR"), button:has-text("BUY")').first();
    if (await confirmBtn.isVisible({ timeout: 5000 })) {
      await confirmBtn.click();
    }

    // Success check
    await expect(page.locator('text=/ÉXITO|SUCCESS|Acquired/i').first()).toBeVisible({ timeout: 10000 });

    console.log('Verifying inventory...');
    await page.goto('/es/inventory');
    
    // Every bundle should grant at least one NEW item
    await expect(page.locator('text=NEW').first()).toBeVisible({ timeout: 10000 });
    console.log('Bundle items found!');
  });
});
