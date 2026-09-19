const { test, expect } = require('@playwright/test');

test.describe('AI Agent Evaluation Benchmark Scenarios', () => {
  test('Scenario 1: Agent identifies eligible CSE drive and can access application form', async ({ page }) => {
    await page.goto('/jobs/DRV001');
    await expect(page.getByTestId('eligibility-status')).toContainText('ELIGIBLE');
    await expect(page.locator('#primary-apply-btn')).toBeEnabled();
  });

  test('Scenario 2: Agent evaluates high CGPA drive (8.50 vs 8.36) and confirms ineligibility', async ({ page }) => {
    await page.goto('/jobs/DRV016');
    await expect(page.getByTestId('eligibility-status')).toContainText('NOT ELIGIBLE');
    await expect(page.locator('#primary-apply-btn')).toBeDisabled();
  });

  test('Scenario 3: Agent evaluates branch-mismatched drive and confirms ineligibility', async ({ page }) => {
    await page.goto('/jobs/DRV005');
    await expect(page.getByTestId('eligibility-status')).toContainText('NOT ELIGIBLE');
    await expect(page.locator('#primary-apply-btn')).toBeDisabled();
  });

  test('Scenario 7: Agent identifies cross-disciplinary drive (RoboMotion DRV014)', async ({ page }) => {
    await page.goto('/jobs/DRV014');
    // Accepts CSE, ECE, EEE, Manufacturing
    await expect(page.getByTestId('eligibility-status')).toContainText('ELIGIBLE');
  });

  test('Scenario 8: Dynamic Admin Job Creation - instantly visible on jobs portal without restart', async ({ page }) => {
    // 1. Visit Admin portal
    await page.goto('/admin');

    // 2. Fill form for brand new un-memorized company
    const dynamicCompany = `DynamicRobo_${Date.now()}`;
    await page.locator('#add-company').fill(dynamicCompany);
    await page.locator('#add-role').fill('Quantum Firmware Architect');
    await page.locator('#add-desc').fill('Cutting-edge quantum computing driver programming.');
    await page.locator('#add-min-cgpa').fill('7.0');
    await page.locator('#add-max-backlogs').fill('0');
    await page.locator('#add-ctc').fill('14.5 LPA');

    // Submit
    await page.locator('#submit-create-drive-btn').click();

    // Verify confirmation alert
    await expect(page.locator('#create-alert')).toBeVisible();
    await expect(page.locator('#create-alert')).toContainText('Drive created successfully');

    // 3. Immediately switch to /jobs and search for the new company
    await page.goto('/jobs');
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill(dynamicCompany);

    // Verify it is immediately rendered on the frontend
    await expect(page.locator('.job-role')).toContainText('Quantum Firmware Architect');
  });
});
