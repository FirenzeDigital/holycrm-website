# HolyCRM.app — public website

A small, self-contained marketing site for HolyCRM.app. Raw HTML, one stylesheet, two
tiny scripts. No build step, no framework, no external requests.

## Who it's written for

A **pastor deciding whether to subscribe** (and the church tech/admin leader helping
them). The copy leads with ministry outcomes — no one falls through the cracks, every
serving team covered, the church at a glance — and keeps mechanism out of it. Anything
about *how* the app is built belongs in `docs/` and `AGENTS.md`, not here.

## Structure

It's a **one-page site** plus two legal pages.

| File | What it is |
|---|---|
| `index.html` | The whole pitch on one page: hero, "sound familiar?", features, getting started, languages, trust & safety, pricing, FAQ, contact. Nav links are in-page anchors (`#why`, `#features`, `#pricing`, `#faq`, `#contact`). |
| `privacy.html` / `terms.html` | Legal templates — **English only, review with counsel before relying on them** (`noindex`). |
| `assets/css/site.css` | All styles; theme tokens mirror `assets/css/styles.css`. |
| `assets/js/i18n.js` | The translation dictionary: `window.I18N = { en, es, "pt-BR" }`. |
| `assets/js/site.js` | Language (auto-detect + `<select>`), light/dark toggle, mobile nav, footer year. |

## Translations

- Languages: **English, Spanish (voseo / rioplatense), Portuguese (Brazil)**. English is
  the source and the fallback.
- On load, `site.js` picks the language from `localStorage["holycrm_site_lang"]`, then the
  browser's `navigator.languages`, defaulting to English. `es-*` → `es`, `pt` / `pt-*` →
  `pt-BR`.
- The header has a language `<select>`; choosing one re-renders the page and is
  remembered.
- Translatable text carries `data-i18n="key"`. Attributes use
  `data-i18n-attr="placeholder:key"` (a `;`- or `,`-separated list). `<title>` and the
  meta description come from the `meta.title` / `meta.desc` keys.
- English text stays in the HTML as the no-JS / crawler fallback, so non-English visitors
  see one quick repaint on load. That's the deliberate trade for not hiding content.
- **Adding a string:** add `data-i18n="section.key"` in the HTML, then add that key to all
  three language blocks in `i18n.js`. Adding a language: add a block keyed by its code and
  a matching `<option>` in every page's `.lang-select`.

## Conventions

- Header and footer are copied into each page (no server-side includes). Change nav or
  footer links in `index.html`, `privacy.html` and `terms.html`.
- "Sign in" links point to `https://app-dev.holycrm.app/login.html` (the product's dev
  instance — swap for the production URL when it's ready).
- Primary call to action is **"Start your church"** → the `#contact` section, since
  there's no self-serve signup yet.
- Light/dark: each page has the same inline pre-paint theme script as the app; `site.js`
  wires the toggle. Colours are defined on bare `:root` and re-declared for
  `prefers-color-scheme: dark` and `[data-theme="dark"]`.
- Copy uses evangelical/protestant vocabulary (culto, pastor, líder, célula, ofrenda),
  never Catholic terms.
- Placeholder contact addresses (`hello@`, `support@`, `security@`, `privacy@holycrm.app`)
  — point these at real inboxes before launch.

## Preview locally

From the repo root:

```bash
python3 pyServer.py
# then open http://localhost:8000/website/
```

## Deployment note

The repo deploys as an Azure Static Web App from the root. Real files are served before
the `navigationFallback` in `staticwebapp.config.json`, so the site is reachable at
`/website/` with no config change. If it should live at a bare path or its own domain,
adjust hosting accordingly.
