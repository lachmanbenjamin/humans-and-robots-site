# RESUME — H&R Lead Pipeline (next session)

Last worked: 2026-05-29. Owner account for the pipeline: **ben.lachman@gmail.com** (owns the Master Sheet).

## STATE
- **Master Sheet** "H&R Master Leads" — ID `1cLxs7ufZRh3TJIUyh0cjhr5TOo24CV7nn6AcLqwTpIk`, tab `Sheet1`. Headers in place, 0 data rows (verified clean).
- **Apps Script** standalone version (`ops/lead-pipeline-standalone.gs`) pasted into a NEW project at script.google.com under ben.lachman@gmail.com. Six Script Properties added (Twilio H&R subaccount SID/token, FROM +12245076358, ALERT_SMS_TO +12246280641, emails).
- **BLOCKER (where we stopped):** `testLead()` ran but Execution log showed only "Execution started / Execution completed" with NONE of the `Logger.log` lines and NO row written. Diagnosis: the editor ran an OLD SAVED version — edits weren't saved before Run. Apps Script always runs the last *saved* version.

## EXACT FIX (do first)
1. In the Apps Script editor, press **Cmd/Ctrl+S**. WAIT for the toast "Project saved." (Code is not live until saved.)
2. Confirm the **function dropdown** (top toolbar) says **`testLead`** — not doGet/doPost.
3. Click **Run**. Open **Execution log**.
4. You should now see lines starting "1. Starting test", "2. Opened sheet...", etc.
   - If "ERROR at sheet step:" → likely authorization scope; re-run, complete Advanced → Go to project (unsafe) → Allow as ben.lachman@gmail.com.
   - If still NO numbered lines → the save isn't taking; try File → (it autosaves), or close/reopen the project, re-paste, save, run.
5. Confirm: test row appears in Master Sheet + test email at ben@humansnrobots.com + SMS on +12246280641 from +12245076358.

## THEN DEPLOY
- **Deploy → New deployment → Web app** → Execute as: **Me** → Who has access: **Anyone** → Deploy → authorize → copy the **/exec URL**.
- Hand the /exec URL to Computer (or paste into the staged form code — see `ops/FORM_REPOINT_READY.md`).

## THEN WIRE FORMS (code pre-staged, NOT yet applied)
- See `ops/FORM_REPOINT_READY.md` for the exact edits to:
  1. `app.js` (site contact form) — swap FormSubmit URL → /exec, POST as text/plain.
  2. Permit Signal landing `index.html` — swap proxy `/api/lead` → /exec.
- After edits: commit + push site repo (GitHub Pages auto-deploys). **Requires Ben's approval to push.**
- Permit Signal landing re-deploy via deploy_website.

## THEN TEST + CLEAN
- Submit each form live → confirm row + email + SMS → delete test rows from Master Sheet.

## THEN ADS (still paused, no spend yet)
- Only after both forms verified end-to-end: build + launch Meta + Google Search ads (~$350). confirm_action required for spend. Log budget lines: Meta $200 + Google $150 one-time.

## OPEN ITEMS / NOTES
- A2P 10DLC: new H&R Twilio number (+12245076358) may need 10DLC registration for reliable US SMS at volume; fine for low-volume internal alerts now.
- Local commit `d3745bd` (lead docs + bound .gs) is NOT pushed. Pending docs (LEAD_ROUTING update, standalone .gs, this file, OUTREACH_PROGRESS) staged locally, awaiting push approval.
