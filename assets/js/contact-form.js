/* HolyCRM.app public site — contact form submission.
   Posts to the Google Apps Script endpoint (same flow proven in static-form.js),
   wired to the real #contact form fields and the site's existing i18n dictionary. */
(function () {
  "use strict";

  var ENDPOINT =
    "https://script.google.com/macros/s/AKfycbw6N8ZkxQ-BIg1m504SRnp8NJY2EcoVzolSm9WoPb-q0mDLlFfYzbXDV67i-YFsoUro/exec";
  var LANG_KEY = "holycrm_site_lang";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var status = form.querySelector(".contact-form-status");

  function lang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved) return saved;
    } catch (e) {}
    return document.documentElement.getAttribute("lang") || "en";
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var data = Object.fromEntries(new FormData(form));

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
      .then(function () {
        form.reset();
        setStatus("success", "contact.form.success");
      })
      .catch(function () {
        setStatus("error", "contact.form.error");
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();
