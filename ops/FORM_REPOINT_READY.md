# Form Re-point — PRE-STAGED edits (apply once /exec URL exists)

Replace `PASTE_EXEC_URL_HERE` with the deployed Apps Script Web App URL (ends in `/exec`).
All three changes are required. The Content-Type MUST be `text/plain` (NOT application/json) — Apps Script returns no CORS headers, and text/plain avoids the browser's CORS preflight. The script's parseBody_ already parses text/plain JSON.

---
## EDIT 1 — `contact.html` (site contact form action)
Line 333. Change:
```html
<form class="contact-form" id="contact-form" aria-label="Contact form" action="https://formsubmit.co/ajax/ben@humansnrobots.com" method="POST">
```
to:
```html
<form class="contact-form" id="contact-form" aria-label="Contact form" action="PASTE_EXEC_URL_HERE" method="POST">
```

## EDIT 2 — `app.js` (contact form payload — add source, keep fields)
Around line 191, the payload object. Replace the FormSubmit-specific payload with one the Apps Script understands. Change:
```js
    var payload = {
      _subject: 'New checkup request from ' + (name || 'humansnrobots.com'),
      _replyto: email,
      _template: 'table',
      _captcha: 'false',
      name: name,
      email: email,
      company: company,
      referral: referral,
      interest: interest ? interestLabel(interest) : '',
      message: message
    };
```
to:
```js
    var payload = {
      source: 'Website Contact',
      name: name,
      email: email,
      company: company,
      referral: referral,
      interest: interest ? interestLabel(interest) : '',
      message: message
    };
```

## EDIT 3 — `app.js` (fetch headers: text/plain to skip CORS preflight)
Around line 211–214. Change:
```js
    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
```
to:
```js
    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (res) {
```
(NOTE: with Apps Script + no-CORS-preflight, res may be opaque depending on redirect; the existing `.then(res.ok...)` works because Apps Script /exec returns 200 with JSON. If res.ok is unreliable, switch the success handling to always-show-success after fetch resolves, since the row write is what matters.)

---
## EDIT 4 — Permit Signal landing (`data-lakes/municipal-permit-signal/landing/public/index.html`)
The landing form currently POSTs to the sandbox proxy `__PORT_5000__/api/lead`. Change the form's fetch target to `PASTE_EXEC_URL_HERE` and Content-Type to `text/plain;charset=utf-8`. The landing payload already includes trade/zip, so normalize_ will tag it source=Permit Signal automatically (or set source:'Permit Signal' explicitly). Then re-deploy the landing via deploy_website.

---
## AFTER APPLYING
1. Site repo: `git add -A && git commit -m "Re-point lead forms to Apps Script Web App" && git push` (REQUIRES BEN APPROVAL). GitHub Pages auto-deploys in ~1 min.
2. Landing: re-deploy via deploy_website (project_path = landing/public).
3. Live test BOTH forms → confirm row in Master Sheet + email + SMS.
4. Delete test rows from Master Sheet.
