/**
 * CAS Incubator OS — Smoke Test
 *
 * Programmatic checks that routes return expected status codes.
 *
 * Usage:
 *   BASE_URL=https://incubator.nexhunt.xyz npx tsx scripts/smoke-test.ts
 *   # Or against local dev:
 *   BASE_URL=http://localhost:3000 npx tsx scripts/smoke-test.ts
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

interface TestCase {
  method?: string;
  path: string;
  description: string;
  expectedStatuses: number[]; // any of these is a pass
  body?: Record<string, unknown>;
}

const PUBLIC_ROUTES: TestCase[] = [
  { path: "/", description: "Home / landing page", expectedStatuses: [200, 307, 302] },
  { path: "/sign-in", description: "Sign-in page", expectedStatuses: [200] },
  { path: "/sign-up", description: "Sign-up page", expectedStatuses: [200] },
  { path: "/join", description: "Join with class code", expectedStatuses: [200] },
  { path: "/showcase", description: "Public showcase", expectedStatuses: [200, 404] },
];

const AUTH_REQUIRED_ROUTES: TestCase[] = [
  { path: "/admin", description: "Admin dashboard (redirect if unauth)", expectedStatuses: [302, 307, 200] },
  { path: "/admin/analytics", description: "Admin analytics", expectedStatuses: [302, 307, 200] },
  { path: "/admin/users", description: "Admin users", expectedStatuses: [302, 307, 200] },
  { path: "/admin/risks", description: "Admin risks", expectedStatuses: [302, 307, 200] },
  { path: "/admin/ai-usage", description: "Admin AI usage", expectedStatuses: [302, 307, 200] },
  { path: "/teacher", description: "Teacher dashboard", expectedStatuses: [302, 307, 200] },
  { path: "/teacher/projects", description: "Teacher projects", expectedStatuses: [302, 307, 200] },
  { path: "/mentor", description: "Mentor dashboard", expectedStatuses: [302, 307, 200] },
  { path: "/mentor/projects", description: "Mentor projects", expectedStatuses: [302, 307, 200] },
  { path: "/student", description: "Student dashboard", expectedStatuses: [302, 307, 200] },
  { path: "/parent", description: "Parent dashboard", expectedStatuses: [302, 307, 200] },
  { path: "/notifications", description: "Notifications page", expectedStatuses: [302, 307, 200] },
];

const API_ROUTES: TestCase[] = [
  {
    path: "/api/notifications/count",
    description: "Notification count (401 if unauth)",
    expectedStatuses: [401, 200],
  },
  {
    path: "/api/notifications",
    description: "Notifications list (401 if unauth)",
    expectedStatuses: [401, 200],
  },
  {
    method: "POST",
    path: "/api/cron/risk-detect",
    description: "Cron endpoint (403 if no CRON_SECRET)",
    expectedStatuses: [403, 200],
  },
];

interface Result {
  path: string;
  description: string;
  status: number | "ERROR";
  pass: boolean;
  error?: string;
}

async function runTest(tc: TestCase): Promise<Result> {
  const url = `${BASE_URL}${tc.path}`;
  try {
    const res = await fetch(url, {
      method: tc.method ?? "GET",
      redirect: "manual",
      headers: { "Content-Type": "application/json" },
      ...(tc.body ? { body: JSON.stringify(tc.body) } : {}),
    });
    const status = res.status;
    const pass = tc.expectedStatuses.includes(status);
    return { path: tc.path, description: tc.description, status, pass };
  } catch (err) {
    return {
      path: tc.path,
      description: tc.description,
      status: "ERROR",
      pass: false,
      error: String(err),
    };
  }
}

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

async function main() {
  console.log(`\n${BOLD}CAS Incubator OS — Smoke Test${RESET}`);
  console.log(`Target: ${BASE_URL}\n`);

  const allTests = [
    { label: "Public Routes", tests: PUBLIC_ROUTES },
    { label: "Auth-Required Routes", tests: AUTH_REQUIRED_ROUTES },
    { label: "API Routes", tests: API_ROUTES },
  ];

  let totalPass = 0;
  let totalFail = 0;
  const failedTests: Result[] = [];

  for (const group of allTests) {
    console.log(`${BOLD}## ${group.label}${RESET}`);
    const results = await Promise.all(group.tests.map(runTest));

    for (const r of results) {
      const icon = r.pass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
      const statusStr = r.status === "ERROR" ? `${RED}ERROR${RESET}` : String(r.status);
      console.log(`  [${icon}] ${r.description.padEnd(45)} ${statusStr}`);
      if (!r.pass) {
        failedTests.push(r);
        totalFail++;
        if (r.error) console.log(`       ${YELLOW}Error: ${r.error}${RESET}`);
      } else {
        totalPass++;
      }
    }
    console.log();
  }

  console.log(`${BOLD}Results: ${GREEN}${totalPass} passed${RESET}${BOLD}, ${RED}${totalFail} failed${RESET}\n`);

  if (failedTests.length > 0) {
    console.log(`${RED}Failed tests:${RESET}`);
    for (const f of failedTests) {
      console.log(`  - ${f.path} (${f.description}) → ${f.status}`);
    }
    console.log();
  }

  if (totalFail > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
