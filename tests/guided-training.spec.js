import { test, expect } from '@playwright/test';

const getTestUser = () => {
  const id = Math.floor(Math.random() * 10000);
  return {
    name: `GUIDED_TEST_${id}`,
    email: `guided_test_${id}_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };
};

const signup = async (page) => {
  const user = getTestUser();
  await page.goto('/es/login');
  await page.locator('button:has-text("Registrarse"), button:has-text("Sign Up")').first().click();
  await page.locator('input[type="text"]').fill(user.name);
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });
  await page.waitForFunction(() => localStorage.getItem('token'), { timeout: 15000 });
  return user;
};

const api = async (page, path, options = {}) => {
  return page.evaluate(
    async ({ path, options }) => {
      const token = localStorage.getItem('token');
      const res = await fetch(path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
      const body = await res.json().catch(() => ({}));
      return { status: res.status, ok: res.ok, body };
    },
    { path, options }
  );
};

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Guided Training MVP', () => {
  test('login/signup redirects to dashboard and new users see onboarding', async ({ page }) => {
    await signup(page);
    await expect(page.getByText(/Que quieres conseguir en Reppy|What do you want to achieve in Reppy/i)).toBeVisible({ timeout: 15000 });
  });

  test('free mode preference hides onboarding on reload', async ({ page }) => {
    await signup(page);
    await expect(page.getByText(/Solo quiero registrar mi progreso|I only want to log progress/i)).toBeVisible({ timeout: 15000 });
    await page.getByText(/Solo quiero registrar mi progreso|I only want to log progress/i).click();
    await expect(page.getByText(/Que quieres conseguir en Reppy|What do you want to achieve in Reppy/i)).toBeHidden({ timeout: 15000 });
    await page.reload();
    await expect(page.getByText(/Que quieres conseguir en Reppy|What do you want to achieve in Reppy/i)).toBeHidden({ timeout: 15000 });

    const mine = await api(page, '/api/training/me');
    expect(mine.ok).toBeTruthy();
    expect(mine.body.onboardingMode).toBe('free');
    expect(mine.body.canShowOnboarding).toBeFalsy();
  });

  test('selecting a plan creates an active guided mission on dashboard', async ({ page }) => {
    await signup(page);

    const select = await api(page, '/api/training/select', {
      method: 'POST',
      body: JSON.stringify({
        planSlug: 'first_pullup_21d',
        daysPerWeek: 3,
        baseline: { pullups: 0, pushups: 5, dips: 0 },
        equipment: { pullupBar: true },
      }),
    });
    expect(select.ok).toBeTruthy();

    await page.reload();
    await expect(page.getByText(/Tu mision de hoy|Your mission today/i)).toBeVisible({ timeout: 15000 });

    const mine = await api(page, '/api/training/me');
    expect(mine.ok).toBeTruthy();
    expect(mine.body.activePlan.slug).toBe('first_pullup_21d');
    expect(mine.body.todayWorkout.blocks.length).toBeGreaterThan(0);
  });

  test('completing a guided routine creates session logs and increases real reps', async ({ page }) => {
    await signup(page);

    const select = await api(page, '/api/training/select', {
      method: 'POST',
      body: JSON.stringify({
        planSlug: 'twenty_pushups_14d',
        daysPerWeek: 3,
        baseline: { pullups: 0, pushups: 4, dips: 0 },
        equipment: { pullupBar: false },
      }),
    });
    expect(select.ok).toBeTruthy();

    const mine = await api(page, '/api/training/me');
    expect(mine.ok).toBeTruthy();

    const start = await api(page, '/api/training/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ planDayId: mine.body.todayWorkout.day.id }),
    });
    expect(start.ok).toBeTruthy();

    const sets = mine.body.todayWorkout.blocks.flatMap(block =>
      Array.from({ length: block.targetSets }, (_, index) => ({
        blockId: block.id,
        setIndex: index + 1,
        exerciseType: block.exerciseType,
        targetReps: block.targetReps,
        actualReps: block.targetReps,
        completed: true,
      }))
    );

    const complete = await api(page, `/api/training/sessions/${start.body.session.id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ sets }),
    });
    expect(complete.ok).toBeTruthy();
    expect(complete.body.totalReps).toBeGreaterThan(0);

    const reps = await api(page, '/api/reps?type=pushups');
    expect(reps.ok).toBeTruthy();
    expect(reps.body.reduce((sum, entry) => sum + Number(entry.count || 0), 0)).toBeGreaterThan(0);
  });

  test('free logging still works after abandoning a plan', async ({ page }) => {
    await signup(page);

    await api(page, '/api/training/select', {
      method: 'POST',
      body: JSON.stringify({
        planSlug: 'first_pullup_21d',
        daysPerWeek: 3,
        baseline: {},
        equipment: {},
      }),
    });

    const abandon = await api(page, '/api/training/abandon', { method: 'POST' });
    expect(abandon.ok).toBeTruthy();

    const log = await api(page, '/api/reps', {
      method: 'POST',
      body: JSON.stringify({ count: 3, exercise_type: 'pullups' }),
    });
    expect(log.ok).toBeTruthy();

    const mine = await api(page, '/api/training/me');
    expect(mine.ok).toBeTruthy();
    expect(mine.body.activePlan).toBeFalsy();
  });
});
