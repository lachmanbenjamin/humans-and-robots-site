# H&R Lead Pipeline — Deploy Guide (Google Apps Script)

This stands up the always-on lead pipeline: every lead → row in the Master Sheet + email to you + Twilio SMS.
Hosted by Google (free, always-on). One-time setup ~3 minutes. After this, no servers to maintain.

---

## STEP 1 — Open the script editor
1. Open the **H&R Master Leads** sheet:
   https://docs.google.com/spreadsheets/d/1cLxs7ufZRh3TJIUyh0cjhr5TOo24CV7nn6AcLqwTpIk/edit
2. Menu: **Extensions → Apps Script**.
3. Delete any starter code in `Code.gs`, paste the entire contents of **`ops/lead-pipeline.gs`**, and Save (disk icon).

## STEP 2 — Add your secrets (Script Properties)
1. In Apps Script, click the **gear icon (Project Settings)** on the left.
2. Scroll to **Script properties → Add script property**. Add these (values you control — never share in chat):

   | Property | Value |
   |---|---|
   | `TWILIO_ACCOUNT_SID` | your Twilio Account SID (starts with `AC...`) |
   | `TWILIO_AUTH_TOKEN`  | your Twilio Auth Token |
   | `TWILIO_FROM`        | `+12245071823` |
   | `ALERT_SMS_TO`       | `+12246280641` |
   | `ALERT_EMAIL_TO`     | `ben@humansnrobots.com` |
   | `ALERT_EMAIL_CC`     | `ben.lachman@gmail.com` |

   (Find SID + Auth Token at https://console.twilio.com — top of the dashboard.)
   If you skip the two Twilio properties, the pipeline still logs leads + emails you; SMS is simply skipped.

## STEP 3 — Deploy as a Web App
1. Top-right: **Deploy → New deployment**.
2. Click the gear next to "Select type" → choose **Web app**.
3. Settings:
   - **Description:** H&R Lead Pipeline
   - **Execute as:** Me (ben@humansnrobots.com)
   - **Who has access:** **Anyone**   ← required so the website forms can post
4. **Deploy**. Authorize when prompted (it's your own script; click through the "unsafe" warning → Advanced → Go to project).
5. Copy the **Web app URL** — it ends in **`/exec`**. Paste it back to me in chat (the URL is not a secret).

## STEP 4 — Verify (optional, do it before sending me the URL)
- In the editor, select function **`testLead`** from the dropdown and click **Run**.
- Check: a new row appears in the Master Sheet, you get an email, and (if Twilio props set) a text. Delete the test row.

## STEP 5 — I wire the forms
Once you send me the `/exec` URL, I will:
- Re-point the humansnrobots.com contact form to it (commit + push the site repo; GitHub Pages auto-deploys).
- Re-point the Chicago Permit Signal landing form to it (re-deploy).
- Run a live end-to-end test from each form and clean up test rows.

---

### Why this design
- **Always-on:** Google hosts it; no Computer sandbox dependency.
- **One destination:** both forms → one Master Sheet with a Source column.
- **<5-min response:** instant SMS + email the moment a lead submits.
- **No fragile third party:** replaces FormSubmit (which was down / erroring on 2026-05-29).
