import { test, expect } from '@playwright/test';

// Configuration for the test user
const getTestUser = () => {
  const id = Math.floor(Math.random() * 10000);
  return {
    name: `REPPY_TEST_${id}`,
    email: `reppy_test_${id}_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };
};

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('E2E Damage Verification', () => {
  let currentUser;

  test.beforeEach(async ({ page }) => {
    currentUser = getTestUser();
    console.log(`Setting up test user: ${currentUser.name}`);
    
    // Register via UI to ensure everything is hooked up
    await page.goto('/es/login');
    
    const signupBtn = page.locator('button:has-text("Registrarse"), button:has-text("Sign Up")').first();
    await signupBtn.click();
    
    await page.locator('input[type="text"]').fill(currentUser.name);
    await page.locator('input[type="email"]').fill(currentUser.email);
    await page.locator('input[type="password"]').fill(currentUser.password);
    
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*social/, { timeout: 20000 });
    
    // Close initial modals
    try {
      await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
      for (let i = 0; i < 5; i++) {
        const dialog = page.locator('div[role="dialog"]').last();
        if (await dialog.isVisible({ timeout: 500 })) {
          const btn = dialog.locator('button:has-text("CERRAR"), button:has-text("COMPRENDIDO"), button:has-text("OK")').last();
          await btn.click({ force: true });
          await page.waitForTimeout(500);
        } else break;
      }
    } catch (e) {}

    await page.goto('/es/dashboard');
  });

  test('should increase damage estimate when equipment is linked', async ({ page }) => {
    // 1. Get Base Estimate
    const pullupsBtn = page.locator('button').filter({ hasText: /Dominadas|Pullups/i }).first();
    await pullupsBtn.click();
    
    const repsInput = page.locator('input[type="number"]').first();
    await repsInput.fill('10');
    
    const estimateSpan = page.locator('.lucide-sword').locator('..').locator('span.text-xl').first();
    
    // Wait for a non-zero base estimate
    console.log('Waiting for base estimate...');
    await expect(async () => {
      const txt = await estimateSpan.innerText();
      expect(parseInt(txt)).toBeGreaterThan(0);
    }).toPass({ timeout: 10000 });
    
    const baseVal = parseInt(await estimateSpan.innerText());
    console.log(`Base Damage: ${baseVal}`);

    // 2. Add Item via Test API
    await page.evaluate(async () => {
      await fetch('/api/test/add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ itemName: 'M_DEBU_FINAL' })
      });
    });

    // 3. Equip in Inventory
    console.log('Navigating to Inventory...');
    await page.goto('/es/inventory');
    await page.waitForSelector('text=/M_DEBU_FINAL/i');
    
    const itemSlot = page.locator('.nexus-slot', { hasText: /M_DEBU_FINAL/i });
    // Click the "ENLAZAR" or "Equipar" button directly
    const equipBtn = itemSlot.locator('button').filter({ hasText: /ENLAZAR|Equipar|Equip/i }).first();
    
    console.log('Equipping M_DEBU_FINAL...');
    await equipBtn.click();
    await page.waitForTimeout(2000); 

    // 4. Verify Increase on Dashboard
    console.log('Verifying result on Dashboard...');
    await page.goto('/es/dashboard');
    await pullupsBtn.click();
    await repsInput.fill('10');
    
    await expect(async () => {
      const newVal = parseInt(await estimateSpan.innerText());
      console.log(`New: ${newVal} (Base: ${baseVal})`);
      expect(newVal).toBeGreaterThan(baseVal);
    }).toPass({ timeout: 10000 });
    
    console.log('Check complete: Damage increased!');
  });
});
