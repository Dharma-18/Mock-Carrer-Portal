/**
 * Client-Side API & Session Management
 * Anna University Simulated Campus Recruitment Portal
 */

const API = {
  baseUrl: '/api',

  // Session Management
  getCurrentUser() {
    try {
      const data = localStorage.getItem('au_portal_user');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    // Default fallback to Arjun Kumar for instant evaluation & Playwright compatibility
    const defaultStudent = {
      id: "AU2027CSE001",
      name: "Arjun Kumar",
      email: "arjun.kumar@ceg.annauniv.edu",
      role: "STUDENT",
      degree: "B.E.",
      branch: "CSE",
      branchFullName: "Computer Science and Engineering",
      academicYear: "Final Year",
      cgpa: 8.36,
      backlogs: 0,
      tenthPercentage: 92.4,
      twelfthPercentage: 94.2,
      graduationYear: 2027,
      skills: ["C++", "Python", "Java", "SQL", "React", "Node.js", "Git", "DSA"]
    };
    localStorage.setItem('au_portal_user', JSON.stringify(defaultStudent));
    return defaultStudent;
  },

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem('au_portal_user');
    } else {
      localStorage.setItem('au_portal_user', JSON.stringify(user));
    }
  },

  async login(studentId, password) {
    const res = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    this.setCurrentUser(data.user);
    return data.user;
  },

  logout() {
    localStorage.removeItem('au_portal_user');
    window.location.href = '/login';
  },

  async getStudent(id) {
    const res = await fetch(`${this.baseUrl}/students/${id}`);
    if (!res.ok) throw new Error('Student profile not found');
    return res.json();
  },

  async getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseUrl}/jobs?${query}`);
    if (!res.ok) throw new Error('Failed to load jobs');
    return res.json();
  },

  async getJob(id, studentId) {
    const query = studentId ? `?studentId=${studentId}` : '';
    const res = await fetch(`${this.baseUrl}/jobs/${id}${query}`);
    if (!res.ok) throw new Error('Failed to load job');
    return res.json();
  },

  async createJob(jobData) {
    const res = await fetch(`${this.baseUrl}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create job');
    return data;
  },

  async getEligibility(studentId, jobId) {
    const res = await fetch(`${this.baseUrl}/students/${studentId}/eligibility/${jobId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to calculate eligibility');
    return data;
  },

  async applyToDrive(studentId, jobId, preferredLocation, resumeUrl) {
    const res = await fetch(`${this.baseUrl}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, jobId, preferredLocation, resumeUrl })
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  async getApplications(studentId) {
    const query = studentId ? `?studentId=${studentId}` : '';
    const res = await fetch(`${this.baseUrl}/applications${query}`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async updateApplicationStatus(id, status, comment) {
    const res = await fetch(`${this.baseUrl}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update application');
    return data;
  },

  async logAction(action, jobId, result, details) {
    try {
      const user = this.getCurrentUser();
      await fetch(`${this.baseUrl}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: user ? user.id : 'STUDENT',
          action,
          jobId,
          result,
          details
        })
      });
    } catch (e) {
      console.warn('Logging action failed:', e);
    }
  },

  async getActivityLogs() {
    const res = await fetch(`${this.baseUrl}/activity`);
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return res.json();
  },

  async getMetrics() {
    const res = await fetch(`${this.baseUrl}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch evaluation metrics');
    return res.json();
  },

  // Helper to render universal navbar
  renderNavbar(activePage = '') {
    const navContainer = document.getElementById('navbar-container');
    if (!navContainer) return;

    const user = this.getCurrentUser();
    const isAdmin = user && user.role === 'ADMIN';

    navContainer.innerHTML = `
      <header class="site-header">
        <div class="header-inner">
          <a href="/dashboard" class="brand-wrapper">
            <div class="emblem-badge">AU</div>
            <div class="brand-text">
              <span class="brand-title">ANNA UNIVERSITY</span>
              <span class="brand-sub">Campus Recruitment Portal (CUIC)</span>
            </div>
          </a>

          <nav>
            <ul class="nav-links">
              <li><a href="/dashboard" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" data-testid="dashboard-link">Dashboard</a></li>
              <li><a href="/jobs" class="nav-link ${activePage === 'jobs' ? 'active' : ''}" data-testid="jobs-link">Placement Drives</a></li>
              <li><a href="/applications" class="nav-link ${activePage === 'applications' ? 'active' : ''}" data-testid="my-applications">My Applications</a></li>
              <li><a href="/profile" class="nav-link ${activePage === 'profile' ? 'active' : ''}" data-testid="profile-link">Profile</a></li>
              ${isAdmin ? `<li><a href="/admin" class="nav-link ${activePage === 'admin' ? 'active' : ''}" data-testid="admin-link">Admin Hub</a></li>` : `<li><a href="/admin" class="nav-link ${activePage === 'admin' ? 'active' : ''}" data-testid="admin-link" style="opacity: 0.8;">Admin</a></li>`}
            </ul>
          </nav>

          <div class="user-controls">
            ${user ? `
              <div class="user-badge" id="user-menu-btn" title="Logged in as ${user.name} (${user.id})">
                <div class="user-avatar">${user.name.charAt(0)}</div>
                <div class="user-info">
                  <span class="user-name">${user.name}</span>
                  <span class="user-sub">${user.role === 'ADMIN' ? 'Placement Director' : `${user.branch} • CGPA ${user.cgpa}`}</span>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="API.logout()" data-testid="logout-button" title="Sign out">Logout</button>
            ` : `
              <a href="/login" class="btn btn-primary btn-sm" data-testid="nav-login-btn">Sign In</a>
            `}
          </div>
        </div>
      </header>
    `;
  },

  // Helper to render institutional footer
  renderFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div>
            <strong>Centre for University-Industry Collaboration (CUIC)</strong><br>
            Anna University, Sardar Patel Road, Guindy, Chennai - 600 025, Tamil Nadu, India.
          </div>
          <div style="text-align: right; opacity: 0.8;">
            <span>Simulated Placement Environment for AI Agent Playwright Benchmark</span><br>
            <span>Deterministic Ground-Truth & Multi-Scenario Browser Automation</span>
          </div>
        </div>
      </footer>
    `;
  }
};
