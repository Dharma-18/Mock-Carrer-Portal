const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Application Submission & Tracking Flow', () => {
  test.beforeEach(() => {
    // Reset DRV004 for idempotent test execution
    const appsFile = path.join(__dirname, '..', 'data', 'applications.json');
    try {
      const data = JSON.parse(fs.readFileSync(appsFile, 'utf8'));
      const filtered = data.filter(a => a.jobId !== 'DRV004');
      fs.writeFileSync(appsFile, JSON.stringify(filtered, null, 2), 'utf8');
    } catch (e) {}
  });

  test('Complete application lifecycle: Apply, Confirm, Verify Success, and Track in My Applications', async ({ page }) => {
    // 1. Visit AppVertex Technologies (DRV004)
    await page.goto('/jobs/DRV004');

    // 2. Verify student is eligible
    const statusBadge = page.getByTestId('eligibility-status');
    await expect(statusBadge).toContainText('ELIGIBLE');

    // 3. Open apply modal
    await page.locator('#primary-apply-btn').click();
    await expect(page.locator('#apply-modal')).toHaveClass(/active/);

    // 4. Confirm application
    const confirmBtn = page.getByTestId('confirm-application');
    await confirmBtn.click();

    // 5. Verify success banner appears on page
    const successBanner = page.getByTestId('application-success');
    await expect(successBanner).toBeVisible();
    await expect(successBanner).toContainText('Application Successfully Submitted');

    // 6. Navigate to My Applications
    await page.getByTestId('my-applications').click();
    await expect(page).toHaveURL(/.*applications/);

    // 7. Verify the new application exists in the table
    const appRow = page.getByTestId('application-DRV004');
    await expect(appRow).toBeVisible();
    await expect(appRow).toContainText('AppVertex Technologies');

    // 8. Re-visit DRV004 and verify duplicate is blocked
    await page.goto('/jobs/DRV004');
    await expect(page.getByTestId('eligibility-status')).toContainText('ALREADY APPLIED');
  });
});
