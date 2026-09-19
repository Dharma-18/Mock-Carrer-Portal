const { test, expect } = require('@playwright/test');

test.describe('Login Flow & Authentication', () => {
  test('should display login form with stable selectors', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByTestId('student-id')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('student-id').fill('INVALID_ID');
    await page.getByTestId('password').fill('wrongpass');
    await page.getByTestId('login-button').click();

    const errorBox = page.locator('#login-error');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('Invalid Student ID or Password');
  });

  test('should successfully authenticate Arjun Kumar and redirect to /dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('student-id').fill('AU2027CSE001');
    await page.getByTestId('password').fill('student123');
    await page.getByTestId('login-button').click();

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.locator('#student-name-hero')).toContainText('Arjun Kumar');
  });
});
