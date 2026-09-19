# Anna University Simulated Campus Recruitment Portal

A polished, browser-based placement portal for engineering students, designed to simulate a realistic campus recruitment flow and act as a deterministic benchmark for AI agents using Playwright.

This project combines a professional university UI, dynamic placement drives, eligibility logic, admin job creation, and browser automation checks in a single local web app.

---

## Overview

The platform is built for:

- Student job discovery and career navigation
- Eligibility checking before applying
- Realistic campus recruitment scenarios
- AI agent benchmarking through UI automation
- Admin-side drive creation and monitoring

It is intentionally structured to be deterministic, fast to run locally, and easy to test with Playwright.

---

## Why this project exists

This portal mirrors a realistic university placement ecosystem while staying fully local and safe for experimentation.

It is useful for:

- validating student-side recruitment flows
- testing AI/browser agents that must read the UI, click through pages, and apply to jobs logically
- simulating campus recruitment rules without real production data
- evaluating eligibility and application behavior under controlled conditions

---

## UI experience

The app includes a modern institutional dashboard influenced by university career portals:

- Clean login experience
- Student dashboard with metrics
- Searchable, filterable placement drive list
- Job description pages with structured hiring details
- Eligibility badge and reasoning status
- Applications view with status tracking
- Placement admin panel for creating new drives
- Responsive layout and university-branded visual styling

---

## Key features

### Student module
- Login with demo credentials
- View student profile and stats
- Explore company drives and job cards
- Search and filter by keyword or branch
- View full JD details
- Check eligibility before applying
- Apply to eligible drives
- Track application history

### Eligibility engine
The backend applies deterministic rules using the student profile and drive requirements, including:

- branch eligibility
- academic year restriction
- minimum CGPA
- maximum backlog limit
- application deadline status
- duplicate application checks
- special cross-disciplinary drive rules

### Admin module
- Create new placement drives from the admin panel
- Publish jobs instantly without restarts
- Add eligibility requirements and CTC details
- Confirm new drives appear in the jobs portal immediately

### Agent benchmark support
The app is designed for Playwright-based browser automation with stable selectors such as:

- `data-testid="student-id"`
- `data-testid="password"`
- `data-testid="login-button"`
- `data-testid="job-card-DRV001"`
- `data-testid="view-jd-DRV001"`
- `data-testid="eligibility-status"`
- `data-testid="activity-log"`

These selectors help automation tools reliably interact with elements across the UI.

---

## Demo accounts

| Role | Student ID / ID | Password | Notes |
|---|---|---:|---|
| Student | `AU2027CSE001` | `student123` | CSE, Final Year, CGPA 8.36 |
| Student | `AU2027ECE002` | `student123` | ECE, Final Year, CGPA 7.42 |
| Student | `AU2028CSE003` | `student123` | CSE, Pre-Final Year, CGPA 8.10 |
| Admin | `ADMIN001` | `admin123` | Placement admin access |

---

## Tech stack

- Node.js
- Express.js
- Static HTML/CSS/JS frontend
- JSON-backed data simulation
- Playwright for browser testing

---

## Project structure

```text
Mock Carrer Portal/
├── data/
│   ├── activity-log.json
│   ├── applications.json
│   ├── jobs.json
│   └── students.json
├── public/
│   ├── admin.html
│   ├── applications.html
│   ├── dashboard.html
│   ├── index.html
│   ├── job.html
│   ├── jobs.html
│   ├── login.html
│   ├── profile.html
│   └── css/
│       └── style.css
├── server/
│   ├── server.js
│   └── services/
│       └── eligibilityEngine.js
├── tests/
│   ├── agent-scenarios.spec.js
│   ├── application.spec.js
│   ├── eligibility.spec.js
│   ├── jobs.spec.js
│   └── login.spec.js
├── package.json
├── playwright.config.js
├── tunnel.js
├── README.md
├── anna-placement-portal-spec.txt
└── node_modules/
```

---

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm start
```

Then open:

```text
http://localhost:3000/login
```

---

## Run in development mode

```bash
npm run dev
```

This starts the server with file watching enabled.

---

## Public access with ngrok

To expose the local portal over the internet:

```bash
ngrok http 3000
```

This creates a public HTTPS URL for the app, useful for remote testing or external automation sessions.

---

## Playwright testing

### Install browsers

```bash
npx playwright install
```

### Run the full test suite

```bash
npm test
```

### Run a specific test file

```bash
npx playwright test tests/jobs.spec.js
```

### Open the Playwright UI runner

```bash
npm run test:ui
```

### Show the HTML report

```bash
npm run test:report
```

---

## Available routes

| Route | Purpose |
|---|---|
| `/login` | Student login page |
| `/dashboard` | Student overview with cards and metrics |
| `/jobs` | Placement drive list and search/filter page |
| `/jobs/:id` | Detailed job description and eligibility page |
| `/applications` | Application tracking and status view |
| `/profile` | Student profile details |
| `/admin` | Placement admin panel |

---

## Backend API highlights

The Express server exposes endpoints for:

- `POST /api/login`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `GET /api/applications`
- `POST /api/applications`
- `PATCH /api/applications/:id/status`
- `GET /api/activity`
- `GET /api/metrics`

These routes support the UI and let the portal behave like a realistic recruitment system.

---

## Agent testing scenarios

The app includes benchmark scenarios for AI agents, such as:

- identifying eligible jobs
- checking branch and CGPA eligibility
- verifying ineligible drives
- accessing a job description directly
- creating a new admin drive and confirming immediate visibility

This makes it suitable for evaluating browser agents that must reason about UI state, fetch job data, and act within a constrained portal.

---

## Notes

- This is a simulated portal for educational and benchmarking purposes.
- It uses fictional companies, students, and placement drives.
- It is not an official university or production deployment.
- The project is intentionally deterministic for UI and browser testing workflows.

---

## License

This project is distributed under the ISC license as defined in the package metadata.

---

## Team / project context

This portal was created to simulate the Anna University campus recruitment experience with a focus on:

- realistic student recruitment workflows
- candidate eligibility decision logic
- placement admin operations
- AI-agent usability testing through browser automation

---

## Quick start summary

```bash
npm install
npm start
# then visit http://localhost:3000/login
```

If you want a more realistic browser-automation workflow, run Playwright tests after the server is up.

