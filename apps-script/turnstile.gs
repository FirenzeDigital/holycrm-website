/**
 * Contact-form Google Apps Script (Código.gs) — ready to paste.
 *
 * This file is NOT served by the website. It is the full Código.gs for the Apps Script
 * project behind the contact form's ENDPOINT (script.google.com). Replace the whole
 * Código.gs with this file. It needs the FormEasy library (already added to that project).
 *
 * Setup: Apps Script → Project Settings → Script properties → add
 *   TURNSTILE_SECRET = <secret key from Cloudflare → Turnstile → your widget>
 *   CONTACT_EMAIL    = <inbox that receives contact-form messages>
 * Never put the secret in the website code.
 * After editing: Deploy → Manage deployments → edit → New version (keeps the /exec URL).
 */

var PROPS = PropertiesService.getScriptProperties();

function doPost(req) {
  var data;
  try {
    data = JSON.parse(req.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_request' });
  }

  if (!verifyTurnstile_(data['cf-turnstile-response'])) {
    return json_({ ok: false, error: 'captcha' });
  }
  delete data['cf-turnstile-response']; // keep the token out of the email

  var email = PROPS.getProperty('CONTACT_EMAIL');
  if (!email) return json_({ ok: false, error: 'not_configured' });

  // Hand the cleaned message to FormEasy, which emails it.
  var contents = JSON.stringify(data);
  FormEasy.setEmail(email);
  return FormEasy.action({
    parameter: req.parameter,
    parameters: req.parameters,
    postData: {
      contents: contents,
      type: req.postData.type,
      length: contents.length,
      name: req.postData.name,
    },
  });
}

function verifyTurnstile_(token) {
  if (!token) return false;
  var secret = PROPS.getProperty('TURNSTILE_SECRET');
  if (!secret) return false; // fail closed if not configured

  var res = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret: secret, response: token },
    muteHttpExceptions: true,
  });
  var out = JSON.parse(res.getContentText() || '{}');
  return out.success === true;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
