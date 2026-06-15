# HANDOVER — H&R Chicago Permit Signal: Outreach + Pipeline + Twilio
**Last refreshed: 2026-06-15 by Atlas (prior thread overloaded; bootstrapping fresh).**

## THE BLUNT TRUTH (read this first)
The outbound ENGINE works perfectly. The HUMAN SEND STEP does not.
- The cron has generated ~125+ InMails over 2+ weeks.
- **Ben has sent 8 total (through #8 Josh Smith on 5/29). ZERO since day one.**
- Manual LinkedIn InMail sending is the bottleneck and it is failing in practice.
- **NEW PRIORITY (Ben, 2026-06-15): "Both, outreach first." Fix the outreach CHANNEL so sends actually happen — likely pivot to automatable EMAIL outreach via Apollo (connector already wired). Carry Twilio/A2P + pipeline /exec as PARKED secondary tasks.**

Do NOT spend the new thread on Twilio cleanup. Spend it on: why is no outreach going out, and what automatable channel fixes it.

---

## #1 NEXT ACTION (outreach-first)
Evaluate pivoting cold outreach from manual LinkedIn InMail → automatable EMAIL via Apollo sequences.
- Apollo connector is connected (`apollo` / `apollo_io__pipedream`).
- The Permit Signal targets (Chicago permit holders / GCs / trades) need email enrichment, then an Apollo sequence with the $297 pilot offer + Stripe link.
- Goal: outreach that runs WITHOUT Ben manually pasting anything. Ben is deaf — every channel must be text/async/automatable. (Email fits perfectly; LinkedIn manual paste does not.)
- LinkedIn automation tools carry ToS/ban risk — flag before recommending.
- Get Ben's approval before sending ANY outreach or enrolling ANY Apollo contacts.

---

## CRON (HEALTHY — do not break)
- **cron_id 66064119**, `0 13 * * 1-5` UTC = weekday 9am ET (EDT). **Change to `0 14 * * 1-5` when DST ends ~Nov 1 2026.**
- Runs: `cd /home/user/workspace/data-lakes/municipal-permit-signal && python scripts/daily_autonomous_run.py`
- Sends EMAIL reminder (WORKING) via gcal connection_id 3206904 + SMS attempt (queued/undelivered — A2P).
- **This cron is server-side and survives thread changes. A new thread does NOT restart or break it.**
- Pool drawdown (as of runs through 6/15): **23 targets remaining after today.** Engine marks whole batch "sent" at generation — if Ben sends only part, un-mark rest in `ops/inmail_sent.txt`.

## TWILIO / A2P (PARKED secondary)
- TWO accounts. PARENT "My first Twilio account" owns **+12245071823**. SUBACCOUNT `AC8d53b343…(subaccount SID — see Twilio console)` owns **+12245076358** (current cron sender).
- Connector `twilio__pipedream` wired to SUBACCOUNT → can only send from 6358.
- BUG: A2P registered on 1823 but sends from 6358 → every SMS = errorCode **30034**, undelivered.
- 1823 A2P campaign was REJECTED for opt-in info. Path A chosen = consolidate on 1823.
- **FIX IN PROGRESS:** consent checkbox is LIVE on https://humansnrobots.com/contact (commit f1f20f0). Resubmission text ready in `ops/A2P_RESUBMISSION.md` — now includes exact OPT-IN KEYWORD (START) + OPT-IN MESSAGE + HELP/STOP responses.
- **Ben must resubmit the campaign himself** (Twilio console, parent account, +12245071823 attached). Agent cannot.
- After approval: reconnect connector to PARENT account, re-point cron 66064119 + Apps Script TWILIO_FROM to +12245071823, test-send to `delivered`, release 6358.
- +12245075361 already RELEASED. Ben's cell (alert recipient): **+12246280641**.

## LEAD PIPELINE (PARKED secondary — blocks on /exec)
- Master Sheet "H&R Master Leads": ID `1cLxs7ufZRh3TJIUyh0cjhr5TOo24CV7nn6AcLqwTpIk`, tab Sheet1, owner ben.lachman@gmail.com. Header-only.
- Apps Script standalone `ops/lead-pipeline-standalone.gs` (created under ben.lachman@gmail.com). NOT deployed; **no /exec URL captured yet.** Deploy = Cmd+S then Run then Deploy → Web App (Execute as: Me; Anyone). That's the blocker.
- Form re-point edits pre-staged in `ops/FORM_REPOINT_READY.md` (both contact.html + Permit Signal landing). Old form posts to broken FormSubmit (HTTP 521).

## PRODUCT (LOCKED)
"Chicago Permit Signal", flat **$297** 2-week pilot. Stripe link `https://buy.stripe.com/6oUeVf64v16savNfnY2ZO00` (prod_UaAkRYhI6f6ox4 / price_1Tb0OfRvcdRqnmq1e9TS2hT9). Meta Pixel 4248643728613848, Google Ads AW-9379331158.

## ADS (PAUSED, no spend)
Meta+Google Search ~$350 via adspirer, only after a verified working outreach/pipeline. Budget at launch: Meta $200 + Google $150 one-time.

## REPO
`lachmanbenjamin/humans-and-robots-site` (PUBLIC, GitHub Pages, CNAME humansnrobots.com), cloned `/home/user/workspace/humans-and-robots-site/`, git identity Ben Lachman <ben@humansnrobots.com>, push via api_credentials=["github"]. Latest pushed: f1f20f0.

## HARD CONSTRAINTS
- Ben is DEAF — all channels text/async/automatable. Build around it; not a blocker.
- NEVER push git / send comms / spend money / modify subscriptions / change DNS without explicit approval.
- confirm_action before ads spend, recurring-task changes, sends.
- Log every H&R cost: `[BUDGET][Humans and Robots] Vendor – Plan – Amount USD – Cadence – Purpose`. Remind of recurring total on change.
- "LOG EVERYTHING + ensure persistent" — every asset/decision/ID/link in durable repo files.
- Provide fresh doc links at thread end.

## BUDGET (recurring, current)
- Twilio number +12245076358 — ~$1.15/mo
- Twilio A2P 10DLC registration — ~$2/mo (+ ~$4 one-time, already paid)
- Released +12245075361 — −$1.15/mo (savings)
- PARKED at ad launch: Meta $200 + Google $150 = $350 one-time.
