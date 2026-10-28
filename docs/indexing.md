# Indexing checklist

The site ships its own discovery surfaces. These are the steps that need a human
account.

## Already automated

| Surface | What it does |
|---|---|
| `sitemap.xml` | Every page, regenerated on each build |
| `robots.txt` | Allows search engines and names AI crawlers explicitly |
| `feed.xml` | RSS for new and updated entries |
| `ai.txt` | Citation and usage preferences for AI systems |
| `llms.txt` | The whole index in plain text, key facts first |
| IndexNow | Deploy pings Bing, Yandex, Seznam and Naver with every URL |

## One-time, needs the owner

1. **Google Search Console** — add `https://akshatnaruka.github.io/aidentity/` as a
   URL-prefix property, verify with the HTML tag (add it to `site/build.js` head),
   submit `sitemap.xml`.
2. **Bing Webmaster Tools** — add the site, import from Search Console, submit the
   sitemap. IndexNow is already wired.
3. **Yandex Webmaster** — same sitemap; IndexNow covers submission.
4. **GitHub repo social preview** — Settings → Social preview → upload
   `site/assets/og.png` (1200×630). The API does not expose this.
5. **Custom domain** — if `aidentity.dev` is bought, point it at Pages, set
   `SITE_URL` in `.github/workflows/deploy-pages.yml`, and keep the old URLs
   redirecting. Update `CITATION.cff` and the README links.

## Checks after a deploy

```bash
curl -s https://akshatnaruka.github.io/aidentity/robots.txt
curl -s https://akshatnaruka.github.io/aidentity/sitemap.xml | grep -c "<loc>"
curl -s https://akshatnaruka.github.io/aidentity/ai.txt
```

Expect 398 URLs, and all three files to return 200.
