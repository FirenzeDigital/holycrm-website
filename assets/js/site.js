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

    var title = t("meta.title", lang);
    if (title) document.title = title.replace(/&amp;/g, "&");
    var md = document.querySelector('meta[name="description"]');
    var desc = t("meta.desc", lang);
    if (md && desc) md.setAttribute("content", desc.replace(/&amp;/g, "&"));

    document.querySelectorAll("[data-lang-select]").forEach(function (sel) {
      sel.value = lang;
    });

    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
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
})();
