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

## TARGET ARCHITECTURE (always-on) — IN PROGRESS
- **Vercel serverless backend** (Ben has Vercel connected). One endpoint `/api/lead` accepts both forms' payloads, writes to Master Sheet, emails Ben, fires Twilio SMS.
- Both humansnrobots.com/contact and the Permit Signal landing POST to this single Vercel endpoint.
- Secrets live as Vercel env vars (NOT thread-scoped):
  - Google Sheets write: service-account JSON **OR** a Google Apps Script Web App URL bound to the Master Sheet.
  - Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN (SMS).
  - Email: handled by Apps Script (MailApp) or SendGrid.
- DECISION PENDING: simplest reliable combo = Google Apps Script Web App (sheet write + email, runs as Ben, zero external creds) + Vercel function calling Twilio for SMS. See NEXT.

## NEXT
1. Stand up the always-on endpoint (Apps Script + Vercel-for-SMS, or full Vercel w/ service account).
2. Re-point humansnrobots.com contact form action → new endpoint; commit + push site repo (GitHub Pages auto-deploys).
3. Re-point Permit Signal landing form → same endpoint.
4. Test each source end-to-end (row + email + SMS); clean test rows.
5. Keep this file updated.
