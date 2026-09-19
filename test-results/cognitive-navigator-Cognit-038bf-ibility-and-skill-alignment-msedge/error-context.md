# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cognitive-navigator.spec.js >> Cognitive navigator accessibility >> cognitive navigator explains eligibility and skill alignment
- Location: tests\cognitive-navigator.spec.js:38:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('navigator-matching-skills')
Expected substring: "Python"
Received string:    ""
Timeout: 5000ms

Call log:
  - Expect "toContainText" getByTestId('navigator-matching-skills') with timeout 5000ms
  - waiting for getByTestId('navigator-matching-skills')
    14 × locator resolved to <div class="tag-list" id="navigator-matching-skills" data-testid="navigator-matching-skills"></div>
       - unexpected value ""

```

```yaml
- banner:
  - link "AU ANNA UNIVERSITY Campus Recruitment Portal (CUIC)":
    - /url: /dashboard
  - navigation:
    - list:
      - listitem:
        - link "Dashboard":
          - /url: /dashboard
      - listitem:
        - link "Placement Drives":
          - /url: /jobs
      - listitem:
        - link "My Applications":
          - /url: /applications
      - listitem:
        - link "Profile":
          - /url: /profile
      - listitem:
        - link "Admin":
          - /url: /admin
  - text: A Arjun Kumar CSE • CGPA 8.36
  - button "Logout"
- main:
  - text: AI Agent Readiness • Structured Opportunity Match
  - heading "Cognitive Navigator" [level=1]
  - paragraph: Evaluate eligible opportunities, align student skills to job requirements, identify gaps, and present a transparent explanation before the student decides to apply.
  - text: Student Arjun Kumar Eligibility ELIGIBLE Branch CSE CGPA 8.36 Backlogs 0 Preferred Role Software Engineer Relevant Opportunity TechNova Systems
  - heading "Software Engineer" [level=2]
  - text: DRV001 Chennai Hybrid Skill Alignment Strong Matching Skills Skill Gaps
  - link "View Full JD":
    - /url: /jobs/DRV001
  - button "Apply"
  - button "Skip"
  - text: Why this job?
- contentinfo:
  - strong: Centre for University-Industry Collaboration (CUIC)
  - text: Anna University, Sardar Patel Road, Guindy, Chennai - 600 025, Tamil Nadu, India. Simulated Placement Environment for AI Agent Playwright Benchmark Deterministic Ground-Truth & Multi-Scenario Browser Automation
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Cognitive navigator accessibility', () => {
  4  |   test('student profile exposes stable selectors', async ({ page }) => {
  5  |     await page.goto('/profile');
  6  | 
  7  |     await expect(page.getByTestId('student-name')).toBeVisible();
  8  |     await expect(page.getByTestId('student-register-number')).toBeVisible();
  9  |     await expect(page.getByTestId('student-degree')).toBeVisible();
  10 |     await expect(page.getByTestId('student-branch')).toBeVisible();
  11 |     await expect(page.getByTestId('student-graduation-year')).toBeVisible();
  12 |     await expect(page.getByTestId('student-cgpa')).toBeVisible();
  13 |     await expect(page.getByTestId('student-backlogs')).toBeVisible();
  14 |     await expect(page.getByTestId('student-skills')).toBeVisible();
  15 |     await expect(page.getByTestId('student-projects')).toBeVisible();
  16 |     await expect(page.getByTestId('student-experience')).toBeVisible();
  17 |     await expect(page.getByTestId('student-preferences')).toBeVisible();
  18 |   });
  19 | 
  20 |   test('job details expose structured metadata', async ({ page }) => {
  21 |     await page.goto('/jobs/DRV001');
  22 | 
  23 |     await expect(page.getByTestId('job-id')).toContainText('DRV001');
  24 |     await expect(page.getByTestId('company-name')).toContainText('TechNova Systems');
  25 |     await expect(page.getByTestId('job-title')).toContainText('Software Engineer');
  26 |     await expect(page.getByTestId('job-description')).toContainText(/TechNova Systems|software/i);
  27 |     await expect(page.getByTestId('job-location')).toContainText('Chennai');
  28 |     await expect(page.getByTestId('job-work-mode')).toContainText('Hybrid');
  29 |     await expect(page.getByTestId('job-salary')).toContainText('9.5 LPA');
  30 |     await expect(page.getByTestId('application-deadline')).toContainText(/2026|2027|Deadline/i);
  31 |     await expect(page.getByTestId('minimum-cgpa')).toContainText('7.50');
  32 |     await expect(page.getByTestId('eligible-branches')).toContainText('CSE');
  33 |     await expect(page.getByTestId('required-skills')).toContainText('C++');
  34 |     await expect(page.getByTestId('preferred-skills')).toContainText('React');
  35 |     await expect(page.getByTestId('selection-process')).toContainText('Online Aptitude');
  36 |   });
  37 | 
  38 |   test('cognitive navigator explains eligibility and skill alignment', async ({ page }) => {
  39 |     await page.goto('/cognitive-navigator?jobId=DRV001');
  40 | 
  41 |     await expect(page.getByTestId('cognitive-navigator')).toBeVisible();
  42 |     await expect(page.getByTestId('navigator-job-title')).toContainText('Software Engineer');
  43 |     await expect(page.getByTestId('navigator-eligibility')).toContainText(/ELIGIBLE|Eligible/i);
  44 |     await expect(page.getByTestId('navigator-skill-alignment')).toContainText(/Strong|Moderate|Limited/i);
> 45 |     await expect(page.getByTestId('navigator-matching-skills')).toContainText('Python');
     |                                                                 ^ Error: expect(locator).toContainText(expected) failed
  46 |     await expect(page.getByTestId('navigator-skill-gaps')).toContainText(/AWS|Docker/i);
  47 |     await expect(page.getByTestId('navigator-why-this-job')).toContainText(/eligible|skills|matches|gaps/i);
  48 |     await expect(page.getByTestId('navigator-apply-btn')).toBeVisible();
  49 |     await expect(page.getByTestId('navigator-skip-btn')).toBeVisible();
  50 |   });
  51 | });
  52 | 
```