# site

Zero-dependency static site generator. No npm install, no framework, no build cache.

```bash
node site/build.js            # → site/dist
node site/serve.js            # → http://localhost:4173
SITE_URL=https://example.com node site/build.js
```

## What it generates

| Output | Source |
|---|---|
| `index.html` | Home: hero, stats, categories, sources |
| `skills/index.html` | Full index with client-side filtering |
| `skills/<id>/index.html` | One page per skill, including its rendered `SKILL.md` |
| `sources/index.html` | Provenance and license table |
| `about/index.html` | How verification and licensing work |
| `registry.json` | The full registry, for machines |
| `llms.txt` | The index in plain text for LLMs |
| `sitemap.xml`, `robots.txt`, `404.html` | Standard |

## Design constraints

- **Static.** Every page is a file. No server, no API, no runtime.
- **Works without JS.** Search and filtering are progressive enhancement.
- **No external requests.** No fonts, no analytics, no CDN.
- **One source of truth.** Everything renders from `registry/skills.json`.

`SITE_URL` controls canonical URLs, the sitemap, and the 404 asset path. The deploy workflow sets it from the Pages base URL, so project sites and custom domains both work.
