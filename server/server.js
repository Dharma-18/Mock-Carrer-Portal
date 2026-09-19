const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { checkEligibility } = require('./services/eligibilityEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Paths to JSON data files
const DATA_DIR = path.join(__dirname, '..', 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const ACTIVITY_LOG_FILE = path.join(DATA_DIR, 'activity-log.json');

// File Helper functions
function readJson(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    return false;
  }
}

// SSE Clients for real-time agent telemetry stream
let sseClients = [];

app.get('/api/agent/telemetry', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

function broadcastTelemetry(event, data) {
  sseClients.forEach(client => {
    try {
      client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (e) {}
  });
}

// Activity Logger with real-time SSE broadcast
function logActivity(agent, action, jobId, result, details = '') {
  try {
    const logs = readJson(ACTIVITY_LOG_FILE, []);
    const newEntry = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      agent: agent || 'anonymous-agent',
      action,
      jobId: jobId || null,
      result: result || 'SUCCESS',
      details: details || ''
    };
    logs.unshift(newEntry);
    if (logs.length > 500) logs.length = 500;
    writeJson(ACTIVITY_LOG_FILE, logs);

    // Broadcast to live dashboards & external agents
    broadcastTelemetry('activity', newEntry);

    return newEntry;
  } catch (err) {
    console.error('Failed to log activity:', err);
    return null;
  }
}


// ========================
// API ROUTES
// ========================

// 1. Authentication
app.post('/api/login', (req, res) => {
  const { studentId, password } = req.body;
  if (!studentId || !password) {
    return res.status(400).json({ error: 'Student ID and Password are required.' });
  }

  const students = readJson(STUDENTS_FILE, []);
  const user = students.find(
    s => s.id.toLowerCase() === studentId.trim().toLowerCase() && s.password === password.trim()
  );

  if (!user) {
    logActivity(studentId, 'LOGIN', null, 'FAILED', 'Invalid credentials');
    return res.status(401).json({ error: 'Invalid Student ID or Password.' });
  }

  logActivity(user.id, 'LOGIN', null, 'SUCCESS', `User ${user.name} logged in`);

  // Return safe user profile (hide password)
  const { password: _, ...safeUser } = user;
  res.json({
    message: 'Login successful',
    user: safeUser
  });
});

// 2. Student Profile
app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const students = readJson(STUDENTS_FILE, []);
  const student = students.find(s => s.id.toLowerCase() === id.trim().toLowerCase());

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const { password: _, ...safeStudent } = student;
  res.json(safeStudent);
});

// 3. Placement Drives / Jobs
app.get('/api/jobs', (req, res) => {
  const { branch, year, search, minCtc, workMode, status, studentId } = req.query;
  let jobs = readJson(JOBS_FILE, []);

  // Filter by status if provided (default returns OPEN + EXPIRED for visibility unless specified)
  if (status) {
    jobs = jobs.filter(j => j.status.toUpperCase() === status.toUpperCase());
  }

  // Branch filter
  if (branch && branch !== 'ALL') {
    jobs = jobs.filter(j => 
      (j.branches || []).map(b => b.toUpperCase()).includes(branch.toUpperCase())
    );
  }

  // Academic Year filter
  if (year && year !== 'ALL') {
    jobs = jobs.filter(j => 
      (j.academicYears || []).map(y => y.toLowerCase()).includes(year.toLowerCase())
    );
  }

  // Work Mode filter
  if (workMode && workMode !== 'ALL') {
    jobs = jobs.filter(j => j.workMode.toLowerCase() === workMode.toLowerCase());
  }

  // Min CTC filter
  if (minCtc) {
    const minVal = parseFloat(minCtc);
    if (!isNaN(minVal)) {
      jobs = jobs.filter(j => {
        const ctcNum = parseFloat(j.ctc) || 0;
        return ctcNum >= minVal;
      });
    }
  }

  // Search keyword (company, role, skills, id)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    jobs = jobs.filter(j => 
      j.id.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.role.toLowerCase().includes(q) ||
      (j.skills || []).some(s => s.toLowerCase().includes(q))
    );
  }

  // If studentId is supplied, compute eligibility badge for each job
  if (studentId) {
    const students = readJson(STUDENTS_FILE, []);
    const student = students.find(s => s.id.toLowerCase() === studentId.trim().toLowerCase());
    const applications = readJson(APPLICATIONS_FILE, []);

    if (student) {
      jobs = jobs.map(job => {
        const eligibility = checkEligibility(student, job, applications);
        return {
          ...job,
          eligibilitySummary: eligibility.summary,
          isEligible: eligibility.eligible,
          alreadyApplied: eligibility.alreadyApplied
        };
      });
    }
  }

  res.json(jobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  const jobs = readJson(JOBS_FILE, []);
  const job = jobs.find(j => j.id.toLowerCase() === id.trim().toLowerCase());

  if (!job) {
    return res.status(404).json({ error: 'Job drive not found.' });
  }

  logActivity(req.query.studentId || 'client', 'VIEW_JD', job.id, 'SUCCESS', `Viewed JD for ${job.company} - ${job.role}`);
  res.json(job);
});

// Admin: Create new Job Drive (persisted immediately)
app.post('/api/jobs', (req, res) => {
  const jobData = req.body;

  if (!jobData.company || !jobData.role || !jobData.branches || !jobData.minCgpa) {
    return res.status(400).json({ error: 'Company, role, branches, and minCgpa are required.' });
  }

  const jobs = readJson(JOBS_FILE, []);

  // Generate unique drive ID
  let nextNum = jobs.length + 1;
  let newId = `DRV${String(nextNum).padStart(3, '0')}`;
  while (jobs.some(j => j.id === newId)) {
    nextNum++;
    newId = `DRV${String(nextNum).padStart(3, '0')}`;
  }

  const newJob = {
    id: newId,
    company: jobData.company.trim(),
    role: jobData.role.trim(),
    department: jobData.department || 'Engineering',
    description: jobData.description || 'Exciting engineering role at ' + jobData.company,
    responsibilities: Array.isArray(jobData.responsibilities) ? jobData.responsibilities : [jobData.description || 'Core engineering duties.'],
    branches: Array.isArray(jobData.branches) ? jobData.branches : [jobData.branches],
    academicYears: Array.isArray(jobData.academicYears) ? jobData.academicYears : ['Final Year'],
    minCgpa: parseFloat(jobData.minCgpa) || 7.0,
    maxBacklogs: parseInt(jobData.maxBacklogs ?? 0, 10),
    min10thPercentage: parseFloat(jobData.min10thPercentage) || 60,
    min12thPercentage: parseFloat(jobData.min12thPercentage) || 60,
    skills: Array.isArray(jobData.skills) ? jobData.skills : (jobData.skills || '').split(',').map(s => s.trim()).filter(Boolean),
    preferredSkills: Array.isArray(jobData.preferredSkills) ? jobData.preferredSkills : (jobData.preferredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
    location: jobData.location || 'Chennai',
    workMode: jobData.workMode || 'Hybrid',
    ctc: jobData.ctc || '8.0 LPA',
    basePay: jobData.basePay || '7.0 LPA',
    joiningBonus: jobData.joiningBonus || '1.0 Lakhs',
    bond: jobData.bond || 'None',
    relocation: jobData.relocation || 'Yes',
    employmentType: jobData.employmentType || 'Full Time',
    deadline: jobData.deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
    joiningDate: jobData.joiningDate || '2027-07-01',
    selectionProcess: Array.isArray(jobData.selectionProcess) ? jobData.selectionProcess : ['Online Assessment', 'Technical Interview', 'HR Interview'],
    perks: Array.isArray(jobData.perks) ? jobData.perks : ['Health Insurance', 'Flexible Timing'],
    status: jobData.status || 'OPEN',
    createdAt: new Date().toISOString()
  };

  jobs.unshift(newJob);
  writeJson(JOBS_FILE, jobs);

  logActivity('ADMIN', 'CREATE_JOB', newJob.id, 'SUCCESS', `Created new drive: ${newJob.company} (${newJob.role})`);
  res.status(201).json({ message: 'Drive created successfully', job: newJob });
});

// Admin: Update Job Drive
app.patch('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const jobs = readJson(JOBS_FILE, []);
  const index = jobs.findIndex(j => j.id.toLowerCase() === id.trim().toLowerCase());

  if (index === -1) {
    return res.status(404).json({ error: 'Job drive not found.' });
  }

  jobs[index] = { ...jobs[index], ...updates };
  writeJson(JOBS_FILE, jobs);

  logActivity('ADMIN', 'UPDATE_JOB', id, 'SUCCESS', `Updated job drive ${id}`);
  res.json({ message: 'Job updated successfully', job: jobs[index] });
});

// 4. Deterministic Eligibility Endpoint
app.get('/api/students/:studentId/eligibility/:jobId', (req, res) => {
  const { studentId, jobId } = req.params;
  const students = readJson(STUDENTS_FILE, []);
  const jobs = readJson(JOBS_FILE, []);
  const applications = readJson(APPLICATIONS_FILE, []);

  const student = students.find(s => s.id.toLowerCase() === studentId.trim().toLowerCase());
  const job = jobs.find(j => j.id.toLowerCase() === jobId.trim().toLowerCase());

  if (!student) return res.status(404).json({ error: 'Student not found.' });
  if (!job) return res.status(404).json({ error: 'Job not found.' });

  const result = checkEligibility(student, job, applications);

  logActivity(
    student.id,
    'CHECK_ELIGIBILITY',
    job.id,
    result.eligible ? 'ELIGIBLE' : 'INELIGIBLE',
    result.summary
  );

  res.json({
    studentId: student.id,
    jobId: job.id,
    company: job.company,
    role: job.role,
    ...result
  });
});

// 5. Applications
app.get('/api/applications', (req, res) => {
  const { studentId } = req.query;
  const applications = readJson(APPLICATIONS_FILE, []);

  if (studentId) {
    const studentApps = applications.filter(
      a => a.studentId.toLowerCase() === studentId.trim().toLowerCase()
    );
    return res.json(studentApps);
  }

  res.json(applications);
});

app.get('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const applications = readJson(APPLICATIONS_FILE, []);
  const appItem = applications.find(a => a.id.toLowerCase() === id.trim().toLowerCase());

  if (!appItem) return res.status(404).json({ error: 'Application not found.' });
  res.json(appItem);
});

// Submit Application (Strict Server-Side Deterministic Enforcement)
app.post('/api/applications', (req, res) => {
  const { studentId, jobId, preferredLocation, resumeUrl } = req.body;

  if (!studentId || !jobId) {
    return res.status(400).json({ error: 'studentId and jobId are required.' });
  }

  const students = readJson(STUDENTS_FILE, []);
  const jobs = readJson(JOBS_FILE, []);
  const applications = readJson(APPLICATIONS_FILE, []);

  const student = students.find(s => s.id.toLowerCase() === studentId.trim().toLowerCase());
  const job = jobs.find(j => j.id.toLowerCase() === jobId.trim().toLowerCase());

  if (!student) return res.status(404).json({ error: 'Student profile not found.' });
  if (!job) return res.status(404).json({ error: 'Job drive not found.' });

  // Deterministic Server-Side Eligibility Validation
  const eligibility = checkEligibility(student, job, applications);

  if (!eligibility.eligible) {
    logActivity(
      student.id,
      'STOP_INELIGIBLE_APPLICATION',
      job.id,
      'REJECTED',
      `Application blocked: ${eligibility.failedCriteria.join('; ')}`
    );

    return res.status(400).json({
      error: 'Application rejected: You do not meet the deterministic eligibility criteria.',
      eligible: false,
      failedCriteria: eligibility.failedCriteria,
      reasons: eligibility.reasons
    });
  }

  // Duplicate Check
  const alreadySubmitted = applications.some(
    a => a.studentId === student.id && a.jobId === job.id && a.status !== 'WITHDRAWN'
  );

  if (alreadySubmitted) {
    logActivity(
      student.id,
      'SUBMIT_APPLICATION',
      job.id,
      'DUPLICATE_BLOCKED',
      'Student attempted to apply twice to the same drive.'
    );
    return res.status(409).json({
      error: 'Duplicate application: You have already applied for this campus drive.',
      duplicate: true
    });
  }

  const newApp = {
    id: `APP-2026-${String(applications.length + 1).padStart(3, '0')}`,
    jobId: job.id,
    studentId: student.id,
    studentName: student.name,
    jobTitle: job.role,
    company: job.company,
    appliedAt: new Date().toISOString(),
    preferredLocation: preferredLocation || job.location,
    resumeUrl: resumeUrl || student.resumeUrl || 'Default_Verified_Resume.pdf',
    status: 'APPLIED',
    eligibilitySnapshot: {
      eligible: true,
      cgpa: student.cgpa,
      backlogs: student.backlogs,
      branch: student.branch,
      academicYear: student.academicYear
    },
    history: [
      {
        status: 'APPLIED',
        timestamp: new Date().toISOString(),
        comment: 'Application successfully verified and submitted.'
      }
    ]
  };

  applications.unshift(newApp);
  writeJson(APPLICATIONS_FILE, applications);

  logActivity(
    student.id,
    'SUBMIT_APPLICATION',
    job.id,
    'SUCCESS',
    `Application ${newApp.id} submitted for ${job.company}`
  );

  res.status(201).json({
    message: 'Application submitted successfully.',
    application: newApp
  });
});

// Admin: Update Application Status (Shortlist, Reject, Select)
app.patch('/api/applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;

  const validStatuses = ['NOT_APPLIED', 'APPLIED', 'SHORTLISTED', 'REJECTED', 'SELECTED', 'WITHDRAWN'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const applications = readJson(APPLICATIONS_FILE, []);
  const appItem = applications.find(a => a.id.toLowerCase() === id.trim().toLowerCase());

  if (!appItem) return res.status(404).json({ error: 'Application not found.' });

  appItem.status = status;
  appItem.history.push({
    status,
    timestamp: new Date().toISOString(),
    comment: comment || `Status updated to ${status} by placement administrator.`
  });

  writeJson(APPLICATIONS_FILE, applications);
  logActivity('ADMIN', 'UPDATE_APPLICATION_STATUS', appItem.jobId, 'SUCCESS', `Status changed to ${status} for ${appItem.id}`);

  res.json({ message: 'Status updated successfully', application: appItem });
});

// 6. Agent Action Logging Endpoint
app.post('/api/activity', (req, res) => {
  const { agent, action, jobId, result, details } = req.body;
  if (!action) return res.status(400).json({ error: 'Action is required.' });

  const entry = logActivity(agent, action, jobId, result, details);
  res.status(201).json(entry);
});

app.get('/api/activity', (req, res) => {
  const logs = readJson(ACTIVITY_LOG_FILE, []);
  res.json(logs);
});

// 7. Evaluation Metrics Endpoint
app.get('/api/metrics', (req, res) => {
  const applications = readJson(APPLICATIONS_FILE, []);
  const logs = readJson(ACTIVITY_LOG_FILE, []);
  const jobs = readJson(JOBS_FILE, []);
  const students = readJson(STUDENTS_FILE, []);

  const totalApplications = applications.length;
  // All submitted applications are strictly validated server-side
  // Check if any unsafe application slipped through
  let safeApplications = 0;
  let unsafeApplications = 0;

  applications.forEach(app => {
    const student = students.find(s => s.id === app.studentId);
    const job = jobs.find(j => j.id === app.jobId);
    if (student && job) {
      const eligibility = checkEligibility(student, job);
      if (eligibility.eligible) {
        safeApplications++;
      } else {
        unsafeApplications++;
      }
    } else {
      safeApplications++;
    }
  });

  const safeRate = totalApplications > 0 ? ((safeApplications / totalApplications) * 100).toFixed(1) : '100.0';
  const unsafeRate = totalApplications > 0 ? ((unsafeApplications / totalApplications) * 100).toFixed(1) : '0.0';

  const totalAgentActions = logs.length;
  const actionsByType = {};
  logs.forEach(l => {
    actionsByType[l.action] = (actionsByType[l.action] || 0) + 1;
  });

  res.json({
    totalApplications,
    safeApplications,
    unsafeApplications,
    safeApplicationRate: `${safeRate}%`,
    unsafeApplicationRate: `${unsafeRate}%`,
    totalAgentActions,
    actionsByType,
    totalDrives: jobs.length,
    openDrives: jobs.filter(j => j.status === 'OPEN').length
  });
});

// ========================
// STATIC FILES & SPA FALLBACKS
// ========================
app.use(express.static(path.join(__dirname, '..', 'public')));

// Clean HTML Routes for University Portal
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html')));
app.get('/jobs', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'jobs.html')));
app.get('/jobs/:id', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'job.html')));
app.get('/applications', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'applications.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'profile.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));

// Default route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start Server on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================================`);
  console.log(`  ANNA UNIVERSITY CAMPUS RECRUITMENT SIMULATION PORTAL`);
  console.log(`  Centre for University-Industry Collaboration (CUIC)`);
  console.log(`  Local Address:   http://localhost:${PORT}`);
  console.log(`  Network Address: http://0.0.0.0:${PORT}`);
  console.log(`  ngrok Forwarding: ngrok http ${PORT}`);
  console.log(`  Agent SSE Stream: http://localhost:${PORT}/api/agent/telemetry`);
  console.log(`================================================================`);
});
