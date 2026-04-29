const { test, expect } = require('@playwright/test');

/**
 * PVP Combat E2E Test
 * Simulates a real-time battle between two users.
 */
test.describe('PVP Combat System', () => {
  let userA = { name: `COMBAT_TEST_A_${Math.floor(Math.random() * 10000)}`, email: `combat_a_${Date.now()}@test.com`, password: 'password123' };
  let userB = { name: `COMBAT_TEST_B_${Math.floor(Math.random() * 10000)}`, email: `combat_b_${Date.now()}@test.com`, password: 'password123' };

  test('should complete a full combat cycle between two users', async ({ browser }) => {
    // 1. Setup two independent browser contexts
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    console.log('Step 1: Registering both test users...');

    // Sign up User A
    await pageA.goto('/es/login');
    await pageA.click('text=Registrarse');
    await pageA.fill('input[placeholder="Ej: John Doe"]', userA.name);
    await pageA.fill('input[placeholder="tu@email.com"]', userA.email);
    await pageA.fill('input[placeholder="••••••••"]', userA.password);
    await pageA.click('button:has-text("Crear Cuenta")');
    await expect(pageA.locator('nav').first()).toBeVisible();

    // Sign up User B
    await pageB.goto('/es/login');
    await pageB.click('text=Registrarse');
    await pageB.fill('input[placeholder="Ej: John Doe"]', userB.name);
    await pageB.fill('input[placeholder="tu@email.com"]', userB.email);
    await pageB.fill('input[placeholder="••••••••"]', userB.password);
    await pageB.click('button:has-text("Crear Cuenta")');
    await expect(pageB.locator('nav').first()).toBeVisible();




    console.log('Step 2: User A searching for User B to initiate challenge...');
    
    await pageA.goto('/es/social');
    // Navigate to Rankings/Search
    await pageA.click('text=Clasificaciones');
    await pageA.fill('input[placeholder*="Buscar"]', userB.name);
    
    // Find User B in results and open profile/compare
    const userResult = pageA.locator(`text=${userB.name}`).first();
    await expect(userResult).toBeVisible();
    await userResult.click();

    // Open challenge modal
    await pageA.click('text=RETAR A DUELO');
    await expect(pageA.locator('text=SISTEMA DE CONFIGURACIÓN')).toBeVisible();


    // Configure and Send Challenge
    await pageA.click('button:has-text("INICIALIZAR COMANDO")');
    
    // Verify redirection to combat arena
    await expect(pageA).toHaveURL(/pvp/);
    await expect(pageA.locator('text=ESPERANDO')).toBeVisible();

    console.log('Step 3: User B accepting challenge...');

    await pageB.goto('/es/social');
    await pageB.click('text=Combates');
    
    // Find the incoming challenge in the Social tab
    const acceptSocialBtn = pageB.locator('button:has-text("ACEPTAR")').first();
    await expect(acceptSocialBtn).toBeVisible();
    await acceptSocialBtn.click();

    // Now in the PvP arena, click the final confirmation button
    await expect(pageB).toHaveURL(/pvp/);
    const acceptFinalBtn = pageB.locator('button:has-text("ACEPTAR RETO")');
    await acceptFinalBtn.waitFor({ state: 'visible' });
    await acceptFinalBtn.click();

    // Verify User B is ready
    await expect(pageB.locator('text=VS')).toBeVisible();


    console.log('Step 4: Active Combat Simulation...');

    // Log browser console
    pageA.on('console', msg => console.log(`PAGE A JS: ${msg.text()}`));
    pageB.on('console', msg => console.log(`PAGE B JS: ${msg.text()}`));

    // Get initial HP values
    const getHP = async (page, pIndex) => {
      // Find bars by style width or by class
      const bars = page.locator('div.h-6 div.rounded-full');
      const count = await bars.count();
      if (count <= pIndex) {
          console.log(`Warning: Found only ${count} HP bars, requested index ${pIndex}`);
          return 100;
      }
      const style = await bars.nth(pIndex).getAttribute('style');
      const match = style.match(/width:\s*([\d.]+)%/);
      return match ? parseFloat(match[1]) : 100;
    };

    const initialHP2_B = await getHP(pageB, 1);
    console.log(`Initial HP state: B=${initialHP2_B}%`);

    // User A logs some reps to attack User B
    const pullupsBtnA = pageA.locator('button:has-text("+10 Dominadas")').first();
    await pullupsBtnA.waitFor({ state: 'visible', timeout: 15000 });
    
    // Check if button is disabled
    const isDisabled = await pullupsBtnA.isDisabled();
    console.log(`Button "+10 Dominadas" isDisabled: ${isDisabled}`);
    
    if (isDisabled) {
        // If disabled, maybe it's because allowed exercises haven't loaded?
        console.log('Button is disabled! Checking fight status...');
        const fightData = await pageA.evaluate(() => window.fight); // Assuming we might have it global for debug, or check UI
    }

    // Listen for the network response to confirm damage
    const logPromiseA = pageA.waitForResponse(res => res.url().includes('/log-set'), { timeout: 15000 });
    await pullupsBtnA.click();
    
    try {
        const logResA = await logPromiseA;
        const logDataA = await logResA.json();
        console.log(`User A attack registered: ${logDataA.damage} DMG. Opponent HP: ${logDataA.opponentHp}`);
        
        // Wait for User B's screen to reflect the damage
        await expect(async () => {
          const currentHP2_B = await getHP(pageB, 1);
          console.log(`Current HP2_B: ${currentHP2_B}%`);
          expect(currentHP2_B).toBeLessThan(initialHP2_B);
        }).toPass({ timeout: 10000 });
    } catch (e) {
        console.error('Failed to get log-set response:', e.message);
        // Take a final screenshot of both pages
        await pageA.screenshot({ path: 'pageA-error.png' });
        await pageB.screenshot({ path: 'pageB-error.png' });
        throw e;
    }

    await contextA.close();
    await contextB.close();


  });
});
