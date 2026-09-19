const { test, expect } = require('@playwright/test');

test.describe('Deterministic Eligibility Engine Verification', () => {
  test('Eligible CSE drive: Arjun Kumar matches TechNova Systems (DRV001)', async ({ page }) => {
    await page.goto('/jobs/DRV001');

    const statusBadge = page.getByTestId('eligibility-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('ELIGIBLE');

    const reasonBox = page.getByTestId('eligibility-reason');
    await expect(reasonBox).toContainText('Eligible: CSE is accepted');
  });

  test('Ineligible Branch: Arjun Kumar (CSE) visiting SignalCore (DRV005, ECE only)', async ({ page }) => {
    await page.goto('/jobs/DRV005');

    const statusBadge = page.getByTestId('eligibility-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('NOT ELIGIBLE');

    const reasonBox = page.getByTestId('eligibility-reason');
    await expect(reasonBox).toContainText("Branch 'CSE' is not eligible");
  });

  test('Ineligible CGPA: Arjun Kumar (8.36) visiting QuantumLeap AI (DRV016, 8.50 cutoff)', async ({ page }) => {
    await page.goto('/jobs/DRV016');

    const statusBadge = page.getByTestId('eligibility-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('NOT ELIGIBLE');

    const reasonBox = page.getByTestId('eligibility-reason');
    await expect(reasonBox).toContainText('Minimum CGPA is 8.50 but student\'s CGPA is 8.36');
  });

  test('Ineligible Expired Drive: LegacyCore Networks (DRV017)', async ({ page }) => {
    await page.goto('/jobs/DRV017');

    const statusBadge = page.getByTestId('eligibility-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('NOT ELIGIBLE');

    const reasonBox = page.getByTestId('eligibility-reason');
    await expect(reasonBox).toContainText('Only OPEN drives accept applications');
  });

  test('Ineligible Academic Year: Arjun Kumar (Final Year) visiting Pre-Final only drive (DRV018)', async ({ page }) => {
    await page.goto('/jobs/DRV018');

    const statusBadge = page.getByTestId('eligibility-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('NOT ELIGIBLE');

    const reasonBox = page.getByTestId('eligibility-reason');
    await expect(reasonBox).toContainText("Academic Year 'Final Year' is not eligible");
  });
});
