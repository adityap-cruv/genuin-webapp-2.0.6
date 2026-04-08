---
name: security-audit
description: Auditing code for security vulnerabilities and reviewing auth changes (read-only)
---
# Skill: Security Audit

Use this skill when auditing code for security vulnerabilities, reviewing auth changes,
or checking that a feature meets the project's security requirements.

This skill is **read-only** — it identifies and reports issues. It does not fix auth,
CORS, CSP, or security headers without explicit team approval.

---

## Audit checklist

Work through every section. Mark each item as ✅ pass, ❌ fail, or ⚠️ needs review.

### 1. Authentication & session management (NextAuth v5)

- [ ] Auth tokens stored in `httpOnly` cookies — never `localStorage` or `sessionStorage`
- [ ] `auth()` is called from `apps/webapp/auth.ts`, not from `next-auth` directly
- [ ] Auth config is at `apps/webapp/auth.ts` and `apps/webapp/auth.config.ts` — not scattered elsewhere
- [ ] `NEXTAUTH_SECRET` is set in the root `.env` — required by NextAuth v5
- [ ] Every protected route/endpoint verifies the session on every request
- [ ] JWT validation checks signature, expiry (`exp`), and issuer (`iss`)
- [ ] Session tokens are rotated after login, privilege change, or password reset
- [ ] Logout invalidates the server-side session — not just the client cookie
- [ ] Failed login attempts are rate-limited
- [ ] Password reset tokens are single-use and expire within a short window (≤ 1 hour)

### 2. Authorisation

- [ ] Every data-fetching function scopes results to the authenticated user's ID
- [ ] No endpoint accepts a `userId` from the request body to determine data access —
      always derive it from the verified session
- [ ] Role checks are enforced server-side, not just hidden in the UI
- [ ] Users cannot access resources belonging to other users (IDOR check)

### 3. Input validation

- [ ] All external data (API request bodies, query params, headers, cookies) is validated
      with Zod at the trust boundary — this project uses Zod throughout
- [ ] Validation happens server-side — client-side validation is UX only, not security
- [ ] File uploads: type validated by content (magic bytes), not just extension; size
      capped; filename sanitised before use in any path or query
- [ ] `dangerouslySetInnerHTML` only used with explicit DOMPurify sanitisation —
      DOMPurify is already installed (`dompurify` package)

### 4. Injection

- [ ] All database queries use parameterised queries or an ORM — no string interpolation
- [ ] No user input passed to `exec()`, `execSync()`, `spawn()`, or `eval()`
- [ ] No user input used in file path construction without `path.resolve()` and a
      directory allowlist check to prevent path traversal
- [ ] No user input rendered as raw HTML without DOMPurify sanitisation

### 5. Secrets & configuration

- [ ] No hardcoded secrets, API keys, tokens, passwords, or connection strings anywhere
- [ ] `.env*` files are in `.gitignore`
- [ ] All required environment variables are validated at startup
- [ ] Only `NEXT_PUBLIC_*` variables are exposed to the browser — others are server-only
- [ ] Error responses sent to clients contain no stack traces, internal paths, or
      database error messages
- [ ] Logs do not contain passwords, tokens, or PII

### 6. API responses

- [ ] Route Handlers return only the fields the client needs — no raw database records
- [ ] Error responses use generic messages for auth failures
      ("Invalid credentials" — not "Email not found" vs "Wrong password")
- [ ] List endpoints are paginated with a maximum page size

### 7. HTTP security headers

Verify these are present on all responses. **Any changes require team approval.**

| Header                      | Expected value                        |
| --------------------------- | ------------------------------------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options`    | `nosniff`                             |
| `X-Frame-Options`           | `DENY` or `SAMEORIGIN`                |
| `Content-Security-Policy`   | Project-specific; must be present     |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`     |

Headers are configured in `apps/webapp/next.config.ts` under `headers()`.

### 8. CORS

- [ ] `Access-Control-Allow-Origin` is a specific allowlist — never `*` on credentialed requests
- [ ] Allowed methods and headers are explicitly listed
- [ ] **CORS changes require team approval**

### 9. Dependencies

- [ ] `pnpm audit` has been run and high/critical CVEs are resolved
- [ ] No new dependencies added without team approval
- [ ] No packages with unexpected network or filesystem access

---

## Severity definitions

Use these consistently across all audit reports:

| Level       | Definition                                                              | Action                  |
| ----------- | ----------------------------------------------------------------------- | ----------------------- |
| 🔴 Critical | Exploitable now. Auth bypass, injection, hardcoded secrets, exposed PII | Block merge immediately |
| 🟠 High     | Serious risk. Missing validation, insecure storage, permissive CORS     | Fix this sprint         |
| 🟡 Medium   | Meaningful risk. Missing rate limit, verbose errors, weak CSP           | Schedule soon           |
| 🟢 Low      | Best practice gap. Minor header issue, outdated dep with no CVE         | Address when convenient |

---

## Finding format

For each issue found, write:

```
**[SEVERITY] Finding title**
- Location: `apps/webapp/src/app/api/users/route.ts` line 42–58
- Issue: What is wrong and why it is a problem
- Risk: What an attacker could do with this
- Fix:
  // Before
  const user = await db.query(`SELECT * FROM users WHERE id = ${req.body.id}`);

  // After
  const user = await db.query('SELECT * FROM users WHERE id = $1', [session.user.id]);
```

---

## Items that require team approval before any fix is applied

- Any change to authentication or session handling logic (`apps/webapp/auth.ts`, `auth.config.ts`)
- Any change to CORS configuration
- Any change to CSP or other security headers (`apps/webapp/next.config.ts`)
- Any change to password hashing or token generation
- Deletion or rename of any public API endpoint

Flag these explicitly in your report even if the fix seems obvious.
