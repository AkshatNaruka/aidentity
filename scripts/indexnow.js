#!/usr/bin/env node
/**
 * Submit every URL in sitemap.xml to IndexNow (Bing, Yandex, Seznam, Naver).
 *
 * The key file is generated into the site at build time, so search engines can
 * verify ownership. Run after a deploy:
 *   node scripts/indexnow.js
 */
const SITE = (process.env.SITE_URL || "https://akshatnaruka.github.io/aidentity").replace(/\/$/, "");
const KEY = "c53fff0269a753a2d4152843dfb58136";

async function main() {
  const sitemap = await fetch(`${SITE}/sitemap.xml`).then((response) => {
    if (!response.ok) throw new Error(`sitemap ${response.status}`);
    return response.text();
  });
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!urls.length) throw new Error("no URLs in sitemap");

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE).host,
      key: KEY,
      keyLocation: `${SITE}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  console.log(`IndexNow: ${response.status} for ${urls.length} URLs`);
  if (!response.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`IndexNow failed: ${error.message}`);
  process.exitCode = 1;
});
