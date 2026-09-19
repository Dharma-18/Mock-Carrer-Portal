const { test, expect } = require('@playwright/test');

test.describe('Jobs Discovery & Listing Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to jobs directly (default student session is active)
    await page.goto('/jobs');
  });

  test('should render job cards with stable testids', async ({ page }) => {
    // Check DRV001 (TechNova Systems)
    const jobCard = page.getByTestId('job-card-DRV001');
    await expect(jobCard).toBeVisible();
    await expect(page.getByTestId('view-jd-DRV001')).toBeVisible();
  });

  test('should filter jobs by search query keyword', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('TechNova');

    // Only TechNova Systems card should be visible
    await expect(page.getByTestId('job-card-DRV001')).toBeVisible();
    await expect(page.getByTestId('job-card-DRV002')).not.toBeVisible();
  });

  test('should filter jobs by engineering branch', async ({ page }) => {
    const branchFilter = page.getByTestId('branch-filter');
    await branchFilter.selectOption('ECE');

    // SignalCore (DRV005) accepts ECE and should be visible
    await expect(page.getByTestId('job-card-DRV005')).toBeVisible();

    // AppVertex (DRV004) only accepts CSE/IT and should not be visible
    await expect(page.getByTestId('job-card-DRV004')).not.toBeVisible();
  });

  test('should navigate to JD page when View JD is clicked', async ({ page }) => {
    await page.getByTestId('view-jd-DRV001').first().click();

    await expect(page).toHaveURL(/.*jobs\/DRV001/);
    await expect(page.locator('#jd-role')).toContainText('Software Engineer');
    await expect(page.locator('#jd-company')).toContainText('TechNova Systems');
  });
});
