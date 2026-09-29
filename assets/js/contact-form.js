/* HolyCRM.app public site — contact form submission.
   Posts to the Google Apps Script endpoint (same flow proven in static-form.js),
   wired to the real #contact form fields and the site's existing i18n dictionary.
   Spam protection: Cloudflare Turnstile. The widget adds its token to the POST as
   "cf-turnstile-response"; the Apps Script verifies it with Cloudflare's siteverify
   API before saving/sending anything. */
(function () {
  "use strict";

  var ENDPOINT =
    "https://script.google.com/macros/s/AKfycbyYbekHKbThDKJupH1mqC3arzzrbcxDyw6OwtI94oUUk3vib_48R34ZjDnbkMrJxI3C/exec";
  // Public site key from Cloudflare → Turnstile (the secret lives only in the Apps Script).
  var TURNSTILE_SITE_KEY = "0x4AAAAAAFGnHzXF82ejxmt1";
  var LANG_KEY = "holycrm_site_lang";
  var THEME_KEY = "holycrm_theme";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var status = form.querySelector(".contact-form-status");
  var captchaEl = form.querySelector("[data-turnstile]");
  var widgetId = null;

  function lang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved) return saved;
    } catch (e) {}
    return document.documentElement.getAttribute("lang") || "en";
  }

  function theme() {
    var th = document.documentElement.getAttribute("data-theme");
    if (!th) {
      try { th = localStorage.getItem(THEME_KEY); } catch (e) {}
    }
    return th === "dark" || th === "light" ? th : "auto";
  }

  function t(key) {
    var dict = window.I18N || {};
    var d = dict[lang()] || {};
    if (d[key] != null) return d[key];
    return (dict.en || {})[key] || "";
  }

  function setStatus(kind, key) {
    if (!status) return;
    status.textContent = t(key);
    status.classList.remove("success", "error");
    if (kind) status.classList.add(kind);
    status.hidden = !kind;
  }

  function resetCaptcha() {
    if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
  }

  // Called by the Turnstile script (?onload=holycrmTurnstileReady) once it has loaded.
  window.holycrmTurnstileReady = function () {
    if (!captchaEl || widgetId !== null) return;
    widgetId = window.turnstile.render(captchaEl, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: theme(),
      language: lang().toLowerCase(),
      action: "contact",
    });
  };

  // Turnstile weighs ~700 KB and the form sits at the bottom of the page, so its
  // script is loaded only when the form comes near the viewport (or gets focus).
  var turnstileRequested = false;
  function loadTurnstile() {
    if (turnstileRequested) return;
    turnstileRequested = true;
    var s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=holycrmTurnstileReady";
    s.async = true;
    document.head.appendChild(s);
  }
  form.addEventListener("focusin", loadTurnstile);
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        loadTurnstile();
      }
    }, { rootMargin: "600px 0px" });
    io.observe(form);
  } else {
    loadTurnstile();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var data = Object.fromEntries(new FormData(form));

    if (!data["cf-turnstile-response"]) {
      setStatus("error", "contact.form.captcha");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    setStatus("", "contact.form.sending");
    status.hidden = false;

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Bad response");
        return res.json();
      })
      .then(function (body) {
        // Apps Script always answers 200; failures are signalled in the body.
        if (body && body.ok === false) {
          throw new Error(body.error === "captcha" ? "captcha" : "failed");
        }
        form.reset();
        setStatus("success", "contact.form.success");
      })
      .catch(function (err) {
        setStatus("error", err && err.message === "captcha" ? "contact.form.captcha" : "contact.form.error");
      })
      .finally(function () {
        // Turnstile tokens are single-use: get a fresh one for any next submit.
        resetCaptcha();
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();
