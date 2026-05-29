# Humans & Robots — Lead Routing Architecture (CANONICAL)

This is the single source of truth for how leads enter H&R from every property.
Last updated: 2026-05-29. Owner: Ben Lachman.

---

## GOAL
Every inbound lead → captured in ONE place, with an instant alert so Ben can respond in **< 5 minutes**.
Pipeline must be **always-on** (independent of any Computer sandbox).

## UNIFIED DESTINATION
- **Master Sheet:** "H&R Master Leads"
  - Spreadsheet ID: `1cLxs7ufZRh3TJIUyh0cjhr5TOo24CV7nn6AcLqwTpIk`
  - URL: https://docs.google.com/spreadsheets/d/1cLxs7ufZRh3TJIUyh0cjhr5TOo24CV7nn6AcLqwTpIk/edit
  - Worksheet ID: 0
  - Columns: Date | Source | Name | Email | Company | Phone | Trade/Topic | ZIP/Area | Referred By | Message
- **Email alert:** ben@humansnrobots.com (CC ben.lachman@gmail.com)
- **SMS alert:** Twilio from +12245071823 → Ben +12246280641 ("respond within 5 min").

## SOURCES (forms that feed the Master Sheet)
| Source value | Origin | Form fields |
|---|---|---|
| Website Contact | humansnrobots.com/contact | name, email, company, referral, interest (dropdown), message + _gotcha honeypot |
| Permit Signal | Chicago Permit Signal landing page | name, email, company, trade, zip |

## CURRENT STATE (2026-05-29)
- **humansnrobots.com/contact**: static GitHub Pages site (repo `lachmanbenjamin/humans-and-robots-site`, CNAME humansnrobots.com).
  - Form posts JSON to `https://formsubmit.co/ajax/ben@humansnrobots.com` (see app.js, the contact-form IIFE).
  - STATUS: **BROKEN** — FormSubmit returned HTTP 521 (service outage) on 2026-05-29; live form shows the error message. FormSubmit is email-only (no structured store, no SMS). Being replaced.
- **Chicago Permit Signal landing**: deployed via Computer sandbox (data-lakes/municipal-permit-signal/landing). Backend server.js handles /api/lead and /api/contact → captureLead() → Master Sheet + email + SMS. Works while sandbox is up; NOT always-on. Fine for short ad tests, not for permanent site routing.

## TARGET ARCHITECTURE (always-on) — DECISION LOCKED 2026-05-29
- **Google Apps Script Web App** is the single always-on endpoint. No Vercel needed — Apps Script does ALL three jobs: writes to Master Sheet, emails Ben (MailApp), fires Twilio SMS (UrlFetchApp). Runs on Google infra, zero external hosting, no thread-scoped secrets.
- Script file: `ops/lead-pipeline-standalone.gs` (STANDALONE — opens Master Sheet by ID, so it does NOT need to be bound to the sheet). Created at script.google.com under **ben.lachman@gmail.com** (the account that owns the Master Sheet — required so "Execute as: Me" has write permission).
  - NOTE: The original sheet-bound version (`ops/lead-pipeline.gs`) could not be opened via the sheet's Extensions→Apps Script editor (Google Drive "unable to open the file" error). The standalone version is the working path.
- Secrets live as Apps Script **Script Properties** (durable, account-scoped, not in any repo):
  - TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN — **H&R Twilio SUBACCOUNT** (separate from Maxxpedia, which owns +12245071823).
  - TWILIO_FROM = **+12245076358** (dedicated H&R number, purchased 2026-05-29 under the new H&R subaccount).
  - ALERT_SMS_TO = +12246280641 (Ben's cell). ALERT_EMAIL_TO = ben@humansnrobots.com. ALERT_EMAIL_CC = ben.lachman@gmail.com.
- Deploy: New deployment → Web app → Execute as: Me (ben.lachman@gmail.com) → Who has access: Anyone → copy /exec URL.
- CORS: Apps Script returns no CORS headers, so both forms must POST as `text/plain` (avoids preflight). parseBody_ parses text/plain JSON.

## TWILIO NUMBER REGISTRY (both numbers logged 2026-05-29)
| Number | Account / Subaccount | Purpose | Status |
|---|---|---|---|
| +12245071823 | Maxxpedia subaccount | Maxxpedia project SMS sender | In use by Maxxpedia — NOT for H&R |
| +12245076358 | Humans & Robots subaccount (new, 2026-05-29) | H&R lead-alert SMS sender (this pipeline's TWILIO_FROM) | Active |
| +12246280641 | (Ben's personal cell) | ALERT_SMS_TO — receives all H&R lead alerts | Recipient |

## BUDGET (per Ben's standing rule)
[BUDGET][Humans and Robots] Twilio – H&R Subaccount phone number (+12245076358) – ~$1.15 USD – Monthly – Dedicated SMS sender for lead-alert pipeline, isolated from Maxxpedia. Plus ~$0.0079 per outbound SMS (usage).

## NEXT
1. Add the six Script Properties (Twilio H&R subaccount SID/token, FROM +12245076358, etc.).
2. Run testLead() in the editor → confirm row + email + SMS; authorize as ben.lachman@gmail.com.
3. Deploy as Web app → capture /exec URL.
4. Re-point humansnrobots.com contact form action → /exec URL (text/plain POST); commit + push site repo (GitHub Pages auto-deploys).
5. Re-point Permit Signal landing form → same /exec URL.
6. Test each source end-to-end (row + email + SMS); clean test rows.
7. Keep this file updated.
