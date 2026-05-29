/**
 * H&R Lead Pipeline — Google Apps Script Web App (STANDALONE version)
 *
 * Use this version if the sheet-bound Apps Script editor won't open.
 * Create it at script.google.com → New project, paste this as Code.gs.
 * It targets the Master Sheet by ID, so it does NOT need to be bound to the sheet.
 *
 * Accepts POST from humansnrobots.com/contact and the Chicago Permit Signal landing page.
 * For each lead: appends a row, emails Ben, and sends a Twilio SMS alert.
 *
 * SETUP (one time):
 *  1. script.google.com → New project. Delete default code. Paste this file.
 *  2. Project Settings (gear) → Script properties → add:
 *        TWILIO_ACCOUNT_SID   = (your Twilio Account SID, starts with AC...)
 *        TWILIO_AUTH_TOKEN    = (your Twilio Auth Token)
 *        TWILIO_FROM          = +12245076358
 *        ALERT_SMS_TO         = +12246280641
 *        ALERT_EMAIL_TO       = ben@humansnrobots.com
 *        ALERT_EMAIL_CC       = ben.lachman@gmail.com
 *  3. Deploy → New deployment → type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *     Click Deploy, authorize (you'll see "Google hasn't verified" → Advanced →
 *     Go to project (unsafe) → Allow), copy the Web app URL (ends in /exec).
 *  4. Send that /exec URL back to Computer to wire both website forms to it.
 *
 * To verify: run testLead() from the editor (writes a test row + emails + texts you).
 */

var SHEET_ID = '1cLxs7ufZRh3TJIUyh0cjhr5TOo24CV7nn6AcLqwTpIk'; // H&R Master Leads
var HEADERS = ['Date', 'Source', 'Name', 'Email', 'Company', 'Phone', 'Trade / Topic', 'ZIP / Area', 'Referred By', 'Message'];

function doPost(e) {
  try {
    var data = parseBody_(e);
    var lead = normalize_(data);
    if (!lead.email || lead.email.indexOf('@') === -1) {
      return json_({ ok: false, error: 'A valid email is required.' });
    }
    appendRow_(lead);
    try { emailBen_(lead); } catch (err) { Logger.log('email error: ' + err); }
    try { smsBen_(lead); } catch (err) { Logger.log('sms error: ' + err); }
    return json_({ ok: true, message: "Thanks — your message is in. We'll be in touch within 24 hours." });
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return json_({ ok: false, error: 'Server error.' });
  }
}

// Simple GET for health checks
function doGet() {
  return json_({ ok: true, service: 'H&R Lead Pipeline' });
}

function parseBody_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    var ct = (e.postData.type || '').toLowerCase();
    if (ct.indexOf('application/json') !== -1) {
      try { return JSON.parse(e.postData.contents); } catch (x) {}
    }
    // try JSON anyway
    try { return JSON.parse(e.postData.contents); } catch (x) {}
  }
  // form-encoded fallback
  return e.parameter || {};
}

function pick_(o, keys) {
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (o[k] != null && String(o[k]).trim() !== '') return String(o[k]).trim();
  }
  return '';
}

function normalize_(d) {
  d = d || {};
  var source = pick_(d, ['source', 'Source']);
  if (!source) source = (pick_(d, ['trade', 'zip']) ? 'Permit Signal' : 'Website Contact');
  return {
    source: source,
    name: pick_(d, ['name', 'Name']),
    email: pick_(d, ['email', 'Email']),
    company: pick_(d, ['company', 'Company']),
    phone: pick_(d, ['phone', 'Phone']),
    topic: pick_(d, ['interest', 'topic', 'trade', 'Trade', 'plate', 'subject']),
    zip: pick_(d, ['zip', 'ZIP', 'area']),
    referredBy: pick_(d, ['referral', 'referred_by', 'referredBy']),
    message: pick_(d, ['message', 'Message'])
  };
}

function sheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID); // <-- standalone: open by ID
  var sh = ss.getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function appendRow_(l) {
  var tz = 'America/Detroit';
  var now = Utilities.formatDate(new Date(), tz, 'M/d/yyyy h:mm a') + ' ET';
  sheet_().appendRow([now, l.source, l.name, l.email, l.company, l.phone, l.topic, l.zip, l.referredBy, l.message]);
}

function emailBen_(l) {
  var props = PropertiesService.getScriptProperties();
  var to = props.getProperty('ALERT_EMAIL_TO') || 'ben@humansnrobots.com';
  var cc = props.getProperty('ALERT_EMAIL_CC') || 'ben.lachman@gmail.com';
  var subject = 'New ' + l.source + ' lead: ' + (l.name || l.email) + (l.topic ? ' (' + l.topic + ')' : '');
  var body =
    'New ' + l.source + ' lead.\n\n' +
    'Name:        ' + (l.name || '(not given)') + '\n' +
    'Email:       ' + (l.email || '(not given)') + '\n' +
    'Company:     ' + (l.company || '(not given)') + '\n' +
    (l.phone ? 'Phone:       ' + l.phone + '\n' : '') +
    'Trade/Topic: ' + (l.topic || '(not given)') + '\n' +
    (l.zip ? 'Area/ZIP:    ' + l.zip + '\n' : '') +
    (l.referredBy ? 'Referred by: ' + l.referredBy + '\n' : '') +
    (l.message ? '\nMessage:\n' + l.message + '\n' : '') +
    '\nGoal: respond within 5 minutes.';
  MailApp.sendEmail({ to: to, cc: cc, subject: subject, body: body });
}

function smsBen_(l) {
  var props = PropertiesService.getScriptProperties();
  var sid = props.getProperty('TWILIO_ACCOUNT_SID');
  var token = props.getProperty('TWILIO_AUTH_TOKEN');
  var from = props.getProperty('TWILIO_FROM') || '+12245076358';
  var to = props.getProperty('ALERT_SMS_TO') || '+12246280641';
  if (!sid || !token) { Logger.log('Twilio creds not set; skipping SMS'); return; }
  var body = 'H&R: new ' + l.source + ' lead — ' + (l.name || l.email) +
    (l.topic ? ' (' + l.topic + ')' : '') + (l.email ? ', ' + l.email : '') +
    '. Respond within 5 min. Reply STOP to opt out.';
  var url = 'https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json';
  var payload = { From: from, To: to, Body: body.slice(0, 320) };
  var options = {
    method: 'post',
    payload: payload,
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(sid + ':' + token) },
    muteHttpExceptions: true
  };
  var resp = UrlFetchApp.fetch(url, options);
  Logger.log('Twilio status ' + resp.getResponseCode() + ': ' + resp.getContentText().slice(0, 200));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run this from the editor to verify the whole pipeline (writes a test row + emails + texts you).
function testLead() {
  doPost({ postData: { type: 'application/json', contents: JSON.stringify({
    source: 'Website Contact', name: 'TEST LEAD', email: 'test@example.com',
    company: 'Test Co', interest: 'A business checkup / audit first', message: 'Pipeline test — delete this row.'
  }) } });
}
