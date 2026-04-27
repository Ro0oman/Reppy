import { test, expect } from '@playwright/test';

// Configuration for the test user
const TEST_USER = {
  name: `TEST_USER_${Math.floor(Math.random() * 10000)}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Comprehensive Damage & Exercise Verification', () => {
  test.beforeEach(async ({ page }) => {
    console.log(`Registering user: ${TEST_USER.name}`);
    await page.goto('/es'); 
    
    // Click the hero button to go to login
    const startBtn = page.locator('button:has-text("UNIRSE AHORA"), button:has-text("CONTINUAR AVENTURA"), button:has-text("JOIN NOW")');
    await startBtn.click();

    await expect(page).toHaveURL(/.*login/);
    
    // Switch to signup mode
    const signupToggle = page.locator('button:has-text("Registrarse"), button:has-text("REGISTER")').first();
    await signupToggle.click();

    // Fill signup form
    await page.locator('input[type="text"]').fill(TEST_USER.name);
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    
    // Submit signup
    await page.click('button[type="submit"]');

    // Wait for redirect to social hub
    await expect(page).toHaveURL(/.*social/, { timeout: 15000 });
    console.log('Login successful');
  });

  test('should calculate damage and show in social feed', async ({ page }) => {
    // 1. Navigate to Dashboard using link with href
    const dashboardLink = page.locator('a[href*="dashboard"]').first();
    await dashboardLink.click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Wait for modals to appear after API fetch
    try {
      await page.waitForSelector('div[role="dialog"]', { timeout: 3000 });
      let dialogsOpen = true;
      let attempts = 0;
      while (dialogsOpen && attempts < 5) {
        attempts++;
        const dialog = page.locator('div[role="dialog"]').last();
        if (await dialog.isVisible({ timeout: 500 })) {
          const btn = dialog.locator('button').last();
          await btn.click({ force: true });
          await page.waitForTimeout(800);
        } else {
          dialogsOpen = false;
        }
      }
    } catch (e) {
      // Modals didn't appear
    }

    // 2. Select Pullups (Dominadas)
    const pullupsBtn = page.locator('button:has-text("Dominadas"), button:has-text("Pullups")').first();
    await pullupsBtn.click();

    // 3. Log 10 reps
    const input = page.locator('input[type="number"]').first();
    await input.fill('10');
    
    // Click Log
    await page.click('button:has(svg.lucide-check)');

    // 4. Verify damage toast
    await expect(page.locator('text=/Registro Actualizado|Stats Updated|logged/i').first()).toBeVisible();

    // 5. Verify in Social Feed
    const socialLink = page.locator('a[href*="social"]').first();
    await socialLink.click();
    
    await page.waitForSelector('.social-card', { timeout: 10000 });
    
    const post = page.locator(`.social-card:has-text("${TEST_USER.name}")`).first();
    await expect(post).toBeVisible();
    
    await expect(post).toContainText('10');
    await expect(post).toContainText('🔥');
    await expect(post).toContainText('⚡');
  });

  test('should increase damage with equipped items', async ({ page }) => {
    // 1. Navigate to Dashboard
    const dashboardLink = page.locator('a[href*="dashboard"]').first();
    await dashboardLink.click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Wait for modals to appear after API fetch
    try {
      await page.waitForSelector('div[role="dialog"]', { timeout: 3000 });
      let dialogsOpen = true;
      let attempts = 0;
      while (dialogsOpen && attempts < 5) {
        attempts++;
        const dialog = page.locator('div[role="dialog"]').last();
        if (await dialog.isVisible({ timeout: 500 })) {
          const btn = dialog.locator('button').last();
          await btn.click({ force: true });
          await page.waitForTimeout(800);
        } else {
          dialogsOpen = false;
        }
      }
    } catch (e) {
      // Modals didn't appear
    }
    
    // Select Pullups
    const pullupsBtn = page.locator('button:has-text("Dominadas"), button:has-text("Pullups")').first();
    await pullupsBtn.click();
    
    // Fill input to show estimate
    const input = page.locator('input[type="number"]').first();
    await input.fill('10');
    
    // Wait for estimate
    const estimateValue = page.locator('.flex.items-center.gap-2 >> span.text-xl.font-black.italic').first();
    await expect(estimateValue).toBeVisible();
    const baseText = await estimateValue.innerText();
    const baseEstimate = parseInt(baseText);

    // 2. Add a legendary item
    const res = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const req = await fetch('/api/test/add-item', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemName: 'Maza de Hierro' })
      });
      return { status: req.status, body: await req.text() };
    });
    console.log('Add Item API:', res);
    expect(res.status).toBe(200);

    // 3. Equip the item in Inventory
    const invLink = page.locator('a[href*="inventory"]').first();
    await invLink.click();
    
    const itemCard = page.locator('text=/Maza de Hierro/i').first();
    await itemCard.click();
    
    await page.click('button:has-text("Equipar"), button:has-text("Equip")');

    // 4. Verify new estimate is higher
    await dashboardLink.click();
    await pullupsBtn.click();
    
    const newInput = page.locator('input[type="number"]').first();
    await newInput.fill('10');
    
    await expect(async () => {
      const newText = await estimateValue.innerText();
      const newEstimate = parseInt(newText);
      expect(newEstimate).toBeGreaterThan(baseEstimate);
    }).toPass({ timeout: 5000 });
    
    console.log(`Base: ${baseEstimate}, New: ${await estimateValue.innerText()}`);
  });
});
