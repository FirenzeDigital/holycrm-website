/* HolyCRM.app public site — behaviour.
   Dependency-free: language (auto-detect + selector), light/dark theme,
   mobile nav, footer year. Translations live in i18n.js (window.I18N). */
(function () {
  "use strict";

  var DICT = window.I18N || {};
  var SUPPORTED = ["en", "es", "pt-BR"];
  var LANG_KEY = "holycrm_site_lang";
  var THEME_KEY = "holycrm_theme"; // shared with the app

  /* ---------------- Language ---------------- */
  function normalizeLang(raw) {
    if (!raw) return null;
    var l = String(raw).toLowerCase();
    if (l === "pt-br" || l === "pt" || l.indexOf("pt-") === 0) return "pt-BR";
    if (l.indexOf("es") === 0) return "es";
    if (l.indexOf("en") === 0) return "en";
    return null;
  }

  function detectLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && SUPPORTED.indexOf(saved) >= 0) return saved;
    } catch (e) {}
    var navs = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || "en"];
    for (var i = 0; i < navs.length; i++) {
      var n = normalizeLang(navs[i]);
      if (n && SUPPORTED.indexOf(n) >= 0) return n;
    }
    return "en";
  }

  function t(key, lang) {
    var d = DICT[lang];
    if (d && d[key] != null) return d[key];
    if (DICT.en && DICT.en[key] != null) return DICT.en[key];
    return null;
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = "en";

    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"), lang);
      if (v != null) el.innerHTML = v;
    });

    // data-i18n-attr="placeholder:key" or "aria-label:key; title:key2"
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(/[;,]/).forEach(function (pair) {
        var bits = pair.split(":");
        if (bits.length === 2) {
          var v = t(bits[1].trim(), lang);
          if (v != null) el.setAttribute(bits[0].trim(), v);
        }
      });
    });

    // Legal pages carry their own meta.<page>.title/desc keys (see
    // data-meta on <body>) so applying the language here doesn't clobber
    // their <title>/description with the homepage's.
    var page = document.body.getAttribute("data-meta");
    var titleKey = page ? "meta." + page + ".title" : "meta.title";
    var descKey = page ? "meta." + page + ".desc" : "meta.desc";
    var title = t(titleKey, lang);
    if (title) document.title = title.replace(/&amp;/g, "&");
    var md = document.querySelector('meta[name="description"]');
    var desc = t(descKey, lang);
    if (md && desc) md.setAttribute("content", desc.replace(/&amp;/g, "&"));

    document.querySelectorAll("[data-lang-select]").forEach(function (sel) {
      sel.value = lang;
    });

    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}

    if (typeof updatePricing === "function") updatePricing();
  }

  var current = detectLang();
  applyLang(current);

  document.querySelectorAll("[data-lang-select]").forEach(function (sel) {
    sel.addEventListener("change", function () {
      current = sel.value;
      applyLang(current);
    });
  });

  /* ---------------- Theme ---------------- */
  function currentTheme() {
    try {
      var s = localStorage.getItem(THEME_KEY);
      if (s === "dark" || s === "light") return s;
    } catch (e) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  function applyTheme(th) {
    document.documentElement.setAttribute("data-theme", th);
    try { localStorage.setItem(THEME_KEY, th); } catch (e) {}
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.textContent = th === "dark" ? "☀" : "☾";
    });
  }
  var themeBtns = document.querySelectorAll(".theme-toggle");
  if (themeBtns.length) {
    applyTheme(currentTheme());
    themeBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyTheme(
          document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"
        );
      });
    });
  }

  /* ---------------- Mobile nav ---------------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---------------- Footer year ---------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------- Pricing toggle (billing period + crypto discount) ---------------- */
  var pricingBox = document.querySelector("[data-pricing]");
  if (pricingBox) {
    var PRICE_BASE = { monthly: 30, annual: 300 };
    var YEARLY_BASELINE = PRICE_BASE.monthly * 12; // full-price monthly billed all year — the reference every discount is measured against
    var CRYPTO_OFF = 0.2;
    var billing = "monthly";
    var crypto = false;
    var amtEl = pricingBox.querySelector("[data-price-amt]");
    var unitEl = pricingBox.querySelector("[data-price-unit]");
    var wasEl = pricingBox.querySelector("[data-price-was]");
    var wasAmtEl = pricingBox.querySelector("[data-price-was-amt]");
    var equivEl = pricingBox.querySelector("[data-price-equiv]");
    var savingsEl = pricingBox.querySelector("[data-price-savings]");
    var billingBtns = pricingBox.querySelectorAll("[data-billing]");
    var cryptoBtn = pricingBox.querySelector("[data-crypto]");

    var fmtAmt = function (n) {
      return n % 1 === 0 ? String(n) : n.toFixed(2);
    };

    var updatePricing = function () {
      var base = PRICE_BASE[billing];
      var price = crypto ? base * (1 - CRYPTO_OFF) : base;
      var annualizedCost = billing === "monthly" ? price * 12 : price;

      amtEl.textContent = fmtAmt(price);
      unitEl.textContent = t(billing === "monthly" ? "price.plan.unit" : "price.plan.unit.year", current) || "";

      wasEl.hidden = !crypto;
      if (crypto) wasAmtEl.textContent = fmtAmt(base);

      if (billing === "annual") {
        equivEl.hidden = false;
        var equivTemplate = t("price.equiv", current) || "≈ {amount}/month";
        equivEl.textContent = equivTemplate.replace("{amount}", "$" + fmtAmt(price / 12));
      } else {
        equivEl.hidden = true;
      }

      var savings = YEARLY_BASELINE - annualizedCost;
      if (savings > 0) {
        savingsEl.hidden = false;
        var pct = Math.round((savings / YEARLY_BASELINE) * 100);
        var savingsTemplate = t("price.savings", current) || "You save {amount}/year ({pct}%)";
        savingsEl.textContent = savingsTemplate.replace("{amount}", "$" + fmtAmt(savings)).replace("{pct}", pct);
      } else {
        savingsEl.hidden = true;
      }

      billingBtns.forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-billing") === billing);
      });
      cryptoBtn.setAttribute("aria-pressed", crypto ? "true" : "false");
    };

    billingBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        billing = b.getAttribute("data-billing");
        updatePricing();
      });
    });
    cryptoBtn.addEventListener("click", function () {
      crypto = !crypto;
      updatePricing();
    });

    updatePricing();
  }
})();
