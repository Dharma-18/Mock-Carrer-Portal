/**
 * Deterministic Eligibility Engine for Anna University Simulated Campus Recruitment Portal
 * Checks student attributes against job criteria deterministically.
 */

function checkEligibility(student, job, existingApplications = []) {
  const reasons = [];
  const failedCriteria = [];

  if (!student || !job) {
    return {
      eligible: false,
      reasons: [],
      failedCriteria: ['Invalid student or job parameters provided.']
    };
  }

  // 1. Drive Status
  if (job.status !== 'OPEN') {
    failedCriteria.push(`Drive status is ${job.status || 'CLOSED'} (Only OPEN drives accept applications).`);
  } else {
    reasons.push(`Drive is currently OPEN.`);
  }

  // 2. Application Deadline
  const now = new Date();
  const deadline = new Date(job.deadline);
  if (!isNaN(deadline.getTime()) && now > deadline) {
    failedCriteria.push(`Application deadline expired on ${deadline.toLocaleDateString('en-IN')}.`);
  } else if (!isNaN(deadline.getTime())) {
    reasons.push(`Application is open until ${deadline.toLocaleDateString('en-IN')}.`);
  }

  // 3. Branch Verification
  const branchNormalized = (student.branch || '').trim().toUpperCase();
  const allowedBranches = (job.branches || []).map(b => b.trim().toUpperCase());
  const isBranchAllowed = allowedBranches.includes(branchNormalized);
  if (!isBranchAllowed) {
    failedCriteria.push(`Branch '${student.branch}' is not eligible. Accepted branches: ${job.branches.join(', ')}.`);
  } else {
    reasons.push(`Branch '${student.branch}' is accepted.`);
  }

  // 4. Academic Year Verification
  const yearNormalized = (student.academicYear || '').trim().toLowerCase();
  const allowedYears = (job.academicYears || []).map(y => y.trim().toLowerCase());
  const isYearAllowed = allowedYears.includes(yearNormalized);
  if (!isYearAllowed) {
    failedCriteria.push(`Academic Year '${student.academicYear}' is not eligible. Accepted: ${job.academicYears.join(', ')}.`);
  } else {
    reasons.push(`Academic Year '${student.academicYear}' is accepted.`);
  }

  // 5. CGPA Verification
  const studentCgpa = parseFloat(student.cgpa) || 0;
  const minCgpa = parseFloat(job.minCgpa) || 0;
  if (studentCgpa < minCgpa) {
    failedCriteria.push(`Minimum CGPA is ${minCgpa.toFixed(2)} but student's CGPA is ${studentCgpa.toFixed(2)}.`);
  } else {
    reasons.push(`CGPA ${studentCgpa.toFixed(2)} satisfies the minimum requirement of ${minCgpa.toFixed(2)}.`);
  }

  // 6. Backlogs Verification
  const studentBacklogs = parseInt(student.backlogs, 10) || 0;
  const maxBacklogs = parseInt(job.maxBacklogs, 10) ?? 0;
  if (studentBacklogs > maxBacklogs) {
    failedCriteria.push(`Maximum allowed backlogs is ${maxBacklogs} but student has ${studentBacklogs} standing backlog(s).`);
  } else {
    reasons.push(`Backlogs count (${studentBacklogs}) is within allowed limit of ${maxBacklogs}.`);
  }

  // 7. 10th Percentage Verification
  if (job.min10thPercentage && student.tenthPercentage) {
    const min10th = parseFloat(job.min10thPercentage);
    const student10th = parseFloat(student.tenthPercentage);
    if (student10th < min10th) {
      failedCriteria.push(`10th standard mark (${student10th}%) is below minimum required (${min10th}%).`);
    } else {
      reasons.push(`10th mark (${student10th}%) meets minimum requirement of ${min10th}%.`);
    }
  }

  // 8. 12th / Diploma Percentage Verification
  if (job.min12thPercentage && student.twelfthPercentage) {
    const min12th = parseFloat(job.min12thPercentage);
    const student12th = parseFloat(student.twelfthPercentage);
    if (student12th < min12th) {
      failedCriteria.push(`12th/Diploma mark (${student12th}%) is below minimum required (${min12th}%).`);
    } else {
      reasons.push(`12th mark (${student12th}%) meets minimum requirement of ${min12th}%.`);
    }
  }

  // 9. Existing Application Check (Duplicate detection)
  const existingApp = (existingApplications || []).find(
    app => app.jobId === job.id && app.studentId === student.id && app.status !== 'WITHDRAWN'
  );
  if (existingApp) {
    failedCriteria.push(`You have already submitted an application for this drive on ${new Date(existingApp.appliedAt).toLocaleDateString('en-IN')} (Application ID: ${existingApp.id}). Duplicate applications are prohibited.`);
  }

  const eligible = failedCriteria.length === 0;

  // Generate clear natural language summary as required by spec Section 3D & 6
  let summary = '';
  if (eligible) {
    summary = `Eligible: ${student.branch} is accepted, ${student.academicYear} is accepted, CGPA ${studentCgpa.toFixed(2)} >= ${minCgpa.toFixed(2)}, and backlogs ${studentBacklogs} <= ${maxBacklogs}.`;
  } else {
    summary = `Not Eligible: ${failedCriteria.join(' ')}`;
  }

  return {
    eligible,
    summary,
    reasons,
    failedCriteria,
    alreadyApplied: !!existingApp,
    existingApplication: existingApp || null
  };
}

module.exports = {
  checkEligibility
};
