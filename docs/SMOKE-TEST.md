# Smoke Test Guide

Run after every production deployment to verify the app is healthy.

## Automated smoke test

```bash
# Against production
BASE_URL=https://incubator.nexhunt.xyz npx tsx scripts/smoke-test.ts

# Against local dev (run `npm run dev` first)
BASE_URL=http://localhost:3000 npx tsx scripts/smoke-test.ts
```

The script checks:
- Public routes return 200 (`/`, `/sign-in`, `/sign-up`, `/join`)
- Auth-required routes return 302/307 when unauthenticated (or 200 if accessible)
- API routes return correct status codes (401 for unauth, 403 for missing secrets)

Exit code 0 = all pass. Exit code 1 = one or more failures.

## Manual checklist

After deploy, verify these manually in a browser:

### As unauthenticated user
- [ ] `/` loads the landing page
- [ ] `/sign-in` loads Clerk sign-in
- [ ] `/sign-up` loads Clerk sign-up
- [ ] `/join` loads the class-code entry form
- [ ] `/admin` redirects to sign-in (not 500)

### As super_admin
- [ ] `/admin` shows the overview dashboard
- [ ] `/admin/analytics` loads charts
- [ ] `/admin/ai-usage` shows AI usage data
- [ ] `/admin/users` lists users with role selector
- [ ] `/admin/risks` lists risk flags
- [ ] Notification bell shows in top-right
- [ ] First-run tour appears on first login (once only)

### As student
- [ ] `/student` dashboard loads
- [ ] `/student/intake` works if not yet completed
- [ ] First-run tour appears on first login

### As teacher / mentor
- [ ] Dashboard loads
- [ ] Project detail page shows "Flag Risk" button
- [ ] First-run tour appears on first login

### Mobile (iPhone 13, 390px)
- [ ] Admin sidebar collapses → hamburger button visible
- [ ] No horizontal scroll on any page
- [ ] All buttons ≥ 44px tap target

### Email
- [ ] Create a new test user → welcome email arrives
- [ ] Create a risk flag → assigned user gets notification

## Common failure modes

| Symptom | Likely cause |
|---------|-------------|
| 500 on `/admin` | Missing `SUPABASE_SERVICE_ROLE_KEY` or DB not migrated |
| 500 on `/api/webhooks/clerk` | Missing `CLERK_WEBHOOK_SECRET` |
| Cron returns 403 | `CRON_SECRET` not set or header missing |
| Email not sent | `RESEND_API_KEY` missing or `NODE_ENV !== production` |
