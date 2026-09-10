# HolyCRM.app — public website · agent guide

This folder is the **public marketing site** for HolyCRM.app. It is being moved into its
own repository, so this file is written to stand alone — it does not assume access to the
product codebase.

Read this before changing anything here.

---

## 1. What HolyCRM.app is (context)

HolyCRM.app is a lightweight, multi-tenant CRM for **evangelical / protestant church**
administration. One deployment serves many churches; a person can belong to several
churches with a different role in each and switch between them without logging out.

The product's areas (each a module a church can turn on):

- **Members** — the congregation directory: status, contact details, home address,
  birthdays, free-form tags.
- **Visitors & follow-up** — first-time guest tracking, a follow-up timeline, a conversion
  funnel, "convert to member".
- **Small groups / cells** — leaders, supervisors, hosts, weekly schedule, a per-meeting
  log (attendance, first-timers, offering), and cell multiplication with lineage.
- **Ministries & activities** — ministries and their recurring or one-off activities.
- **Events & calendar** — agenda / month / week / day views merging events, activities and
  group meetings; timezone-aware (IANA, DST-correct).
- **Serving rotas** — roles with a required head-count, assignments, "needs volunteers"
  detection, volunteer double-booking warnings.
- **Giving & finance** — income/expense transactions, categories, a finance dashboard;
  money stored to the cent.
- **Dashboard** — KPIs and panels: active members, volunteers, people in groups, visitors
  this month, next 7 days, rotas needing volunteers, net giving, six-month growth,
  birthdays.
- **Users & roles** — invite staff by email (branded set-password page); roles
  `admin` / `manager` / `volunteer` / `member`; per-church custom access overrides.
- **Tags & tag roles** — a managed label set; map a church's own word (e.g. *guía*,
  *maestro*) onto a canonical function so member pickers filter correctly.

Languages the product ships: English, Spanish (rioplatense/voseo), Portuguese (Brazil),
generic Portuguese.

**Do not put any of this mechanism detail on the site.** It is background so you describe
the right outcomes, not so you explain how it works.

---

## 2. Who the site is for, and the voice

The reader is a **pastor deciding whether to subscribe** — and secondarily the church's
tech / admin volunteer helping them evaluate it.

Rules for all copy:

- **Lead with ministry outcomes and relief**, not features or architecture: "no one falls
  through the cracks", "every serving team is covered", "the church at a glance", "your
  team on the same page".
- **Cut mechanism.** No "static HTML", "membership-based rules", "UTC storage", "fails
  closed", "runtime translation", "registry-driven". If a sentence explains *how*, rewrite
  it as *what the pastor gets*.
- **Frame safety as stewardship** in plain words: "each church's information stays
  separate", "only the people you choose can see it", "we never sell or share it", "export
  or delete anytime".
- **Evangelical / protestant vocabulary only.** Use: culto, servicio, pastor, líder,
  anciano, diácono, grupo pequeño, célula, miembro, congregación, hermano/a, ministerio,
  voluntario, ofrenda, diezmo. Never: misa, parroquia, sacerdote, cura, párroco, feligrés,
  sacramentos, catequesis, primera comunión.
- **Spanish uses voseo** (rioplatense): *empezá*, *contanos*, *mirá*, *tu iglesia*,
  *registrá*. Not *empieza / cuéntanos / tu iglesia* peninsular forms.
- Keep it warm and concrete. Short sentences. No hype ("revolutionary", "seamless").

---

## 3. Tech shape

- **Raw HTML, CSS, and vanilla JS. No build step, no framework, no package manager.**
  Editing a file *is* the deploy.
- **Zero external requests.** No CDN scripts, no analytics beacon, no external images or
  webfont CDN. Everything is inline or in `assets/`. If you need an asset, embed it
  (data URI) or add a file under `assets/`. Keep it this way — it makes the site fast,
  private, and portable. (The one webfont, Fraunces for the brand wordmark, is
  **self-hosted** in `assets/fonts/` — not loaded from Google Fonts.)
- One stylesheet, two scripts. Do not add a third dependency to solve a local problem.
- Progressive enhancement: the page is fully readable with JavaScript disabled (English).
  JS only adds the language swap, theme toggle, and mobile menu.

---

## 4. File structure

```
website/
  index.html        One-page site. All sections + in-page anchor nav.
  privacy.html      Legal — English-only DRAFT, noindex. Review with counsel.
  terms.html        Legal — English-only DRAFT, noindex. Review with counsel.
  assets/
    css/site.css    All styles. Theme tokens (light + dark). @font-face for Fraunces. One file.
    js/i18n.js      Translation dictionary: window.I18N = { en, es, "pt-BR" }.
    js/site.js      Language (detect + selector), theme toggle, mobile nav, footer year.
    fonts/          Fraunces woff2 (Google Fonts / OFL), subset to latin + latin-ext,
                    used only by the brand wordmark.
  README.md         Human quick-start.
  AGENTS.md         This file.
```

### Brand wordmark

The logo is a **Fraunces** wordmark, not an icon: `holycrm.app` in Fraunces Heavy Italic
(900) plus a bold-roman (700) tagline. Markup is `.brand` with `.brand__name` +
`.brand__tag`; the header uses it inline (a hairline `::before` divider on the tag, tag
hidden below 620px), the footer uses `.brand--stack` (two lines, no divider). The tagline
carries `data-i18n="brand.tagline"` → "Software for Churches" / "Software para Iglesias" /
"Software para Igrejas". `holycrm.app` itself is never translated. If you restyle it,
keep the same wordmark in the product app so the two stay consistent.

`index.html` sections and their ids: hero (`#top`), `#why`, `#features`, `#start` area,
`#languages`, `#trust`, `#pricing`, `#faq`, `#contact`, then a closing CTA. The header nav
links to `#why #features #pricing #faq #contact`.

There is **no server-side include**. The `<header>` and `<footer>` blocks are copied
verbatim into `index.html`, `privacy.html`, and `terms.html`. If you change navigation or
footer links, change all three.

---

## 5. Internationalisation

### How it works

- Supported languages: **`en`, `es`, `pt-BR`**. English is the source and the fallback —
  every key must exist in `en`.
- Any translatable text node has `data-i18n="some.key"`. On load (and on selector change)
  `site.js` sets `element.innerHTML = I18N[lang][key]`, falling back to `I18N.en[key]`,
  then to leaving the HTML as written.
- **`innerHTML` is used**, so values may contain simple inline markup (`<em>`, `&amp;`,
  `&nbsp;`). The dictionary is authored by us and trusted; never feed user input through
  it.
- Attributes: `data-i18n-attr="placeholder:contact.form.messagePh"`. Multiple attrs are
  separated by `;` or `,` — `data-i18n-attr="aria-label:a11y.lang; title:a11y.lang"`.
- `<title>` and `<meta name="description">` are translated from the `meta.title` /
  `meta.desc` keys (the `&amp;` in a value is collapsed back to `&` for these two).
- For a sentence that contains a link, split it: a `<span data-i18n="x.note">` for the
  prose and a sibling `<a data-i18n="x.note.link">` for the link text, so the `href` stays
  in the HTML and out of the dictionary. See the trust-note paragraph in `index.html`.

### Language detection (in `site.js`)

1. `localStorage["holycrm_site_lang"]` if it is one of the supported codes.
2. Otherwise the first entry of `navigator.languages` that maps to a supported code:
   `pt-br` / `pt` / `pt-*` → `pt-BR`, `es*` → `es`, `en*` → `en`.
3. Otherwise `en`.

The header `<select class="lang-select" data-lang-select>` lets the visitor override;
the choice is saved to `holycrm_site_lang`. The `<option>` values are the language codes.

Because English lives in the HTML, a non-English visitor sees one fast repaint on load.
That is the deliberate trade for not hiding content from crawlers / no-JS.

### Adding a string

1. Put `data-i18n="section.key"` (or `data-i18n-attr`) on the element in every HTML file
   that uses it.
2. Add `"section.key": "..."` to **all three** language blocks in `assets/js/i18n.js`.
   Keep the blocks at full key parity — the validation snippet below checks this.

### Adding a language

1. Add a block keyed by the code (e.g. `"fr"`) to `assets/js/i18n.js`, translating every
   key.
2. Add `<option value="fr">Français</option>` to the `.lang-select` in `index.html`,
   `privacy.html`, `terms.html`.
3. Add the code to `SUPPORTED` and the `normalizeLang()` mapping in `assets/js/site.js`.
4. `<option>` label text is the language's own endonym and is not itself translated.

### Legal pages

`privacy.html` and `terms.html` are **English-only** on purpose (they are drafts pending
legal review). Their header/footer still translate; the legal body does not. If real,
reviewed translations arrive, translate the body then — do not machine-translate legal
text.

---

## 6. Theme (light / dark)

- Each page has a tiny inline script in `<head>` that reads `localStorage["holycrm_theme"]`
  and sets `data-theme` before first paint (no flash).
- `site.js` wires the `.theme-toggle` button and writes `holycrm_theme`.
- In `site.css`, every colour is a token defined on bare `:root` (light), then re-declared
  under both `@media (prefers-color-scheme: dark)` (guarded `:root:not([data-theme="light"])`)
  and `:root[data-theme="dark"]`. Never give a colour its only definition inside a
  media/attribute block. `body` has an explicit token background.
- `holycrm_theme` is the same key the product app uses; harmless on a separate domain,
  a nice continuity if ever served same-origin.

---

## 7. Links & CTAs

- Primary CTA everywhere: **"Start your church"** → the `#contact` section. There is no
  self-serve signup, so never link a CTA to a "sign up" route.
- Secondary: **"Sign in"** → `https://app-dev.holycrm.app/login.html` (the product's
  **dev** instance). **⚠️ Swap this for the production login URL when prod is ready** —
  search every `href="https://app-dev.holycrm.app/login.html"` across `index.html`,
  `privacy.html`, `terms.html`.
- Contact form `action="mailto:hello@holycrm.app"` — it opens the visitor's mail client;
  there is no backend. If a real form endpoint is added later, swap the `action`/`method`
  and keep the mailto addresses as a fallback in the side cards.
- Contact addresses `hello@ / support@ / security@ / privacy@ holycrm.app` are
  placeholders — confirm they are real inboxes before launch.

---

## 8. Local preview

Any static server works. From this folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

`file://` will not work correctly (the scripts and relative paths expect HTTP).

---

## 9. Deployment

- Static hosting, no build. Publish the folder as-is; `index.html` is the entry point.
- Set cache headers so `assets/*` can be cached but HTML revalidates, or fingerprint asset
  names when you change them.
- All three HTML files are self-contained; there is no routing to configure beyond serving
  files and a 404 fallback of your choice.
- `privacy.html` / `terms.html` carry `<meta name="robots" content="noindex">` while they
  are drafts. Remove that once they are finalised.
- Consider adding `robots.txt` and a `sitemap.xml` (only `index.html`, `privacy.html`,
  `terms.html`) when the domain is live.

---

## 10. Before you finish a change — checklist

- [ ] Copy still reads for a pastor: outcomes, not mechanism; evangelical vocabulary;
      Spanish in voseo.
- [ ] New/changed strings have `data-i18n` and exist in **all three** language blocks.
- [ ] Header and footer edits applied to `index.html`, `privacy.html`, `terms.html`.
- [ ] No new external request (script, font, image, fetch) was introduced.
- [ ] Works with JS off (English), and in light and dark theme.
- [ ] Checked at ~375px and desktop; the page body does not scroll horizontally.

Validation snippets:

```bash
# JS parses
node --check assets/js/site.js && node --check assets/js/i18n.js

# translation key parity + every HTML data-i18n key is defined in `en`
node -e '
global.window={}; require("./assets/js/i18n.js"); const D=window.I18N;
const base=new Set(Object.keys(D.en));
for(const l of Object.keys(D)){ if(l==="en")continue;
  const s=new Set(Object.keys(D[l]));
  const miss=[...base].filter(k=>!s.has(k)), extra=[...s].filter(k=>!base.has(k));
  console.log(l, "missing:", miss.join(",")||"none", "| extra:", extra.join(",")||"none");
}
const fs=require("fs");
const html=["index.html","privacy.html","terms.html"].map(f=>fs.readFileSync(f,"utf8")).join("\n");
const used=new Set();
for(const m of html.matchAll(/data-i18n(?:-attr)?="([^"]+)"/g))
  m[1].split(/[;,]/).forEach(p=>used.add(p.includes(":")?p.split(":")[1].trim():p.trim()));
console.log("HTML keys missing from en:", [...used].filter(k=>!base.has(k)).join(",")||"none");
'

# HTML tag balance
python3 - <<'PY'
import html.parser, pathlib
class V(html.parser.HTMLParser):
    VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(s): super().__init__(); s.st=[]; s.e=[]
    def handle_starttag(s,t,a):
        if t not in s.VOID: s.st.append(t)
    def handle_endtag(s,t):
        if t in s.VOID: return
        for i in range(len(s.st)-1,-1,-1):
            if s.st[i]==t:
                if i!=len(s.st)-1: s.e.append(f"mismatch </{t}>")
                del s.st[i:]; return
        s.e.append(f"stray </{t}>")
for f in sorted(pathlib.Path('.').glob('*.html')):
    p=V(); p.feed(f.read_text())
    if p.st: p.e.append(f"unclosed {p.st}")
    print(f.name, "OK" if not p.e else p.e)
PY
```
