# Anna University Simulated Campus Recruitment Portal (CUIC)

A realistic, deterministic simulated campus placement portal designed for engineering students and for benchmarking AI agents using browser automation (Playwright).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server Locally
```bash
npm start
```
The portal will be live on:
**http://localhost:3000**

---

## 🌐 Forwarding Network URL Using ngrok

You can expose this local placement portal to public networks (e.g. for remote browser automation, mobile testing, or cloud agent access) via ngrok:

```bash
# Forward port 3000 to a public HTTPS URL
ngrok http 3000
```
ngrok will generate a secure public URL such as `https://xxxx-xx-xx.ngrok-free.app` that mirrors `http://localhost:3000`.

---

## 🔑 Demo Accounts (1-Click Fill on Login Page)

| Role | Student ID | Password | Branch | Academic Year | CGPA | Backlogs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Student** | `AU2027CSE001` | `student123` | CSE | Final Year | **8.36** | 0 |
| **Student** | `AU2027ECE002` | `student123` | ECE | Final Year | **7.42** | 0 |
| **Student** | `AU2028CSE003` | `student123` | CSE | Pre-Final Year | **8.10** | 1 |
| **Placement Admin** | `ADMIN001` | `admin123` | CUIC Director | Admin | — | — |

---

## 📋 Stable Selectors for Playwright Automation

Every interactive element incorporates stable `data-testid` attributes:
- `data-testid="student-id"`: Student ID / Roll No login field
- `data-testid="password"`: Password login field
- `data-testid="login-button"`: Login form submit button
- `data-testid="jobs-link"`: Navigation link to placement drives
- `data-testid="job-card-<JOB_ID>"`: Container card for a drive (e.g., `job-card-DRV001`)
- `data-testid="view-jd-<JOB_ID>"`: Direct link to complete JD
- `data-testid="apply-<JOB_ID>"`: Quick apply button
- `data-testid="eligibility-status"`: Result badge (`ELIGIBLE`, `NOT ELIGIBLE`, or `ALREADY APPLIED`)
- `data-testid="eligibility-reason"`: Detailed natural language reasoning breakdown
- `data-testid="confirm-application"`: Submit application confirmation button
- `data-testid="application-success"`: Success confirmation banner
- `data-testid="my-applications"`: Applications tracking container
- `data-testid="application-<JOB_ID>"`: Application table row / card
- `data-testid="activity-log"`: Real-time agent activity feed container on Admin page

---

## 🧪 Running Playwright Automated Tests

Install Playwright browsers (if running for the first time):
```bash
npx playwright install chromium
```

Run test suite:
```bash
npm test
```

Run tests with visual UI runner:
```bash
npm run test:ui
```

---

## 🏛️ System Features

1. **Deterministic Eligibility Engine (`server/services/eligibilityEngine.js`)**:
   - Evaluates branch cutoffs, academic year eligibility, minimum CGPA, maximum backlogs, 10th/12th percentages, drive deadline, and duplicate submissions.
2. **18 Campus Placement Drives (`data/jobs.json`)**:
   - Covers CSE, IT, ECE, EEE, and Manufacturing engineering.
   - Includes cross-disciplinary drives, high-CGPA cutoff drives, and expired test cases.
3. **Admin Job Creation (`/admin`)**:
   - Placement officers can publish new recruitment drives with immediate live visibility without restarting the server.
4. **Agent Action Logging & Metrics (`/api/activity`, `/api/metrics`)**:
   - Calculates Safe Application Rate, Unsafe Application Rate, and logs every browser operation.
5. **Institutional Design System**:
   - Anna University / CEG institutional branding, glassmorphism, responsive grid layout, and dark mode aesthetics.
