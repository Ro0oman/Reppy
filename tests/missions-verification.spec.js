import { test, expect } from '@playwright/test';

const getTestUser = () => {
  const id = Math.floor(Math.random() * 10000);
  return {
    name: `MISSION_TEST_${id}`,
    email: `mission_test_${id}_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };
};

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Automated Missions & Rotation Verification', () => {
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
    await expect(page).toHaveURL(/.*social/, { timeout: 20000 });
    
    // Close initial modals if any
    try {
      await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
      const closeBtn = page.locator('button:has-text("CERRAR"), button:has-text("COMPRENDIDO"), button:has-text("OK")').last();
      while (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {}
  });

  test('should display active missions and handle completion/claim loop', async ({ page }) => {
    console.log('Navigating to Missions...');
    await page.goto('/es/missions');
    await page.waitForLoadState('networkidle');

    // 1. Verify 3 missions are present (2 Daily, 1 Special/Tactical)
    const missionCards = page.locator('.mission-card');
    await expect(missionCards).toHaveCount(3, { timeout: 15000 });
    console.log('3 missions found.');

    // 2. Verify statuses are IN_PROGRESS
    const missionStatus = page.locator('.mission-card').first().getByRole('button');
    await expect(missionStatus).toContainText(/PROGRESO|PROGRESS/i);

    // 3. Force complete missions via Test API
    console.log('Forcing mission completion via test API...');
    await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      await fetch('/api/test/complete-missions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    });

    // 4. Refresh and verify CLAIM button appears
    await page.reload();
    const claimBtn = page.locator('button:has-text("RECLAMAR"), button:has-text("CLAIM")').first();
    await expect(claimBtn).toBeVisible({ timeout: 15000 });
    console.log('Missions marked as COMPLETED (Claim button visible).');

    // 5. Claim a mission and verify reward
    await claimBtn.click();
    
    // Success message check (notification store)
    await expect(page.locator('text=/REWARD CLAIMED|RECOMPENSA RECLAMADA/i').first()).toBeVisible({ timeout: 10000 });
    console.log('Mission claimed successfully.');

    // 6. Verify Refill Logic (Infinite Pool)
    // After claiming, it should eventually be replaced or show as claimed
    // In our Missions.vue, it shows CLAIMED status badge
    const claimedBadge = page.locator('text=/RECLAMADO|CLAIMED/i').first();
    await expect(claimedBadge).toBeVisible();
    
    // If the user navigates away and back, or reloads, it should REFILL (because GET / refill logic)
    await page.reload();
    await expect(missionCards).toHaveCount(3);
    // At least one should be back to IN_PROGRESS (the new one)
    const newStatusBtn = page.locator('.mission-card').getByRole('button');
    await expect(newStatusBtn.filter({ hasText: /PROGRESO|PROGRESS/i }).first()).toBeVisible();
    console.log('Infinite pool refill verified: new mission appeared after reload.');
  });
});
