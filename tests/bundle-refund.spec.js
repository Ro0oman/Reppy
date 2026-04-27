import { test, expect } from '@playwright/test';

const getTestUser = () => {
    const id = Math.floor(Math.random() * 10000);
    return {
        name: `REFUND_TEST_${id}`,
        email: `refund_test_${id}_${Date.now()}@example.com`,
        password: 'TestPassword123!',
    };
};

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Shop Bundle Refund Verification', () => {
    let currentUser;

    test.beforeEach(async ({ page }) => {
        currentUser = getTestUser();
        console.log(`Setting up test user: ${currentUser.name}`);

        // Register
        await page.goto('/es/login');
        const signupBtn = page.locator('button:has-text("Registrarse"), button:has-text("Sign Up")').first();
        await signupBtn.click();

        await page.locator('input[type="text"]').fill(currentUser.name);
        await page.locator('input[type="email"]').fill(currentUser.email);
        await page.locator('input[type="password"]').fill(currentUser.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/.*social/, { timeout: 20000 });

        // Bypass onboarding modals
        try {
            await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
            const closeBtn = page.locator('button:has-text("CERRAR"), button:has-text("COMPRENDIDO"), button:has-text("OK")').last();
            while (await closeBtn.isVisible({ timeout: 500 })) {
                await closeBtn.click({ force: true });
                await page.waitForTimeout(500);
            }
        } catch (e) { }

        // Grant initial coins
        await page.evaluate(async () => {
            const token = localStorage.getItem('token');
            await fetch('/api/test/add-coins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: 1000 })
            });
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
    });

    test('should apply discount when purchasing bundle with already owned items', async ({ page }) => {
        const bundleId = 702; // Pack Táctico Común
        const subItemId = 567; // Máscara de Oolacile
        const bundlePrice = 350;
        const subItemPrice = 100;
        const expectedFinalBalance = 650; // 1000 - 100 (subitem) - 250 (bundle after 100 refund)

        console.log('Step 1: Verifying initial coin balance...');
        await page.goto('/es/shop');
        await page.waitForLoadState('networkidle');
        
        await expect(page.getByTestId('reppy-coins')).toHaveText('1000', { timeout: 10000 });

        console.log('Step 2: Purchasing bundle sub-item...');
        await page.evaluate(async (id) => {
            const token = localStorage.getItem('token');
            await fetch(`/api/shop/buy/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }, subItemId);

        await page.reload();
        await expect(page.getByTestId('reppy-coins')).toHaveText('900', { timeout: 10000 });
        console.log('Individual item purchased. Balance: 900.');

        console.log('Step 3: Purchasing the bundle (two-step modal flow)...');
        // Find the specific bundle card and click it to open the modal
        const bundleCard = page.locator('.group\\/bundle, .shop-card').filter({ hasText: /Pack Táctico Común|Tactical Pack/i }).first();
        await expect(bundleCard).toBeVisible({ timeout: 10000 });
        await bundleCard.click(); // Click card to open modal
        
        console.log('Modal opened. Clicking final acquisition button...');
        // The button in the bundle modal
        const finalBuyButton = page.locator('button:has-text("Iniciar Adquisición"), button:has-text("Acquire")').last();
        await expect(finalBuyButton).toBeVisible({ timeout: 5000 });
        await finalBuyButton.click();

        // Verify Success Toast or Notification
        await expect(page.locator('text=/Acquired|Adquirido|Success|Éxito/i').first()).toBeVisible({ timeout: 10000 });

        console.log('Step 4: Final balance verification...');
        await page.goto('/es/shop'); // Go back to shop to see the updated balance in the header
        await page.waitForLoadState('networkidle');
        
        await expect(page.getByTestId('reppy-coins')).toHaveText('650', { timeout: 15000 });

        console.log('Refund Logic Verified: Deduction was exactly 250 (350 price - 100 refund).');
    });
});
