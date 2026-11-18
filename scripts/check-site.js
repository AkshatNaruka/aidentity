#!/usr/bin/env node
"use strict";

/**
 * Post-build quality gate for site/dist.
 *
 *   node scripts/check-site.js            # exit 1 on any error
 *
 * Checks every generated HTML page for:
 *   - broken internal links and assets (href/src that resolve to no file)
 *   - duplicate element ids
 *   - <img> without alt
 *   - indexable pages (no robots noindex) missing <title>, meta description,
 *     canonical, or exactly one <h1>
 *   - sitemap entries that point at missing or noindex pages
 *
 * Zero dependencies, runs in well under a second on the full site.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.resolve(process.env.SITE_DIST || path.join(ROOT, "site", "dist"));
const SITE = (process.env.SITE_URL || "https://akshatnaruka.github.io/aidentity").replace(/\/$/, "");
const BASE = new URL(SITE).pathname.replace(/\/$/, "");

if (!fs.existsSync(DIST)) {
  console.error("site/dist is missing. Run: node site/build.js");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function resolveTarget(fromFile, url) {
  let target;
  if (url.startsWith("/")) {
    // Root-relative URLs are written against the production base path.
    if (BASE && !(url === BASE || url.startsWith(BASE + "/"))) return null;
    target = path.join(DIST, url.slice(BASE.length));
  } else {
    target = path.join(path.dirname(fromFile), url);
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
  return target;
}

const rel = (file) => path.relative(DIST, file).split(path.sep).join("/");
const errors = [];
const warnings = [];
const noindexPages = new Set();
const files = walk(DIST);

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const page = rel(file);
  // Ignore inline scripts and JSON-LD when scanning markup.
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

  for (const match of markup.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const raw = match[1].replace(/&amp;/g, "&");
    const url = raw.split("#")[0].split("?")[0];
    if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url) || url.includes("${")) continue;
    const target = resolveTarget(file, decodeURI(url));
    if (target === null) {
      errors.push(`${page}: root-relative link outside site base: ${raw}`);
    } else if (!fs.existsSync(target)) {
      errors.push(`${page}: broken link ${raw}`);
    }
  }

  const seen = new Set();
  for (const match of markup.matchAll(/\sid="([^"]+)"/g)) {
    if (seen.has(match[1])) errors.push(`${page}: duplicate id "${match[1]}"`);
    seen.add(match[1]);
  }

  for (const img of markup.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)) {
    errors.push(`${page}: <img> without alt: ${img[0].slice(0, 80)}`);
  }

  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
  if (noindex) {
    noindexPages.add(page);
    continue;
  }
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${page}: missing <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${page}: missing meta description`);
  if (!/<link rel="canonical" href="[^"]+"/.test(html)) errors.push(`${page}: missing canonical`);
  const h1 = (markup.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${page}: expected exactly one <h1>, found ${h1}`);
}

const sitemapFile = path.join(DIST, "sitemap.xml");
if (fs.existsSync(sitemapFile)) {
  const locs = [...fs.readFileSync(sitemapFile, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    if (!loc.startsWith(SITE)) {
      warnings.push(`sitemap: ${loc} is outside ${SITE}`);
      continue;
    }
    let target = path.join(DIST, decodeURI(loc.slice(SITE.length)));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target)) errors.push(`sitemap: ${loc} has no page`);
    else if (noindexPages.has(rel(target))) errors.push(`sitemap: ${loc} is noindex`);
  }
}

for (const warning of warnings) console.warn(`warn  ${warning}`);
if (errors.length) {
  for (const error of errors.slice(0, 50)) console.error(`FAIL  ${error}`);
  if (errors.length > 50) console.error(`... and ${errors.length - 50} more`);
  console.error(`Site check failed: ${errors.length} error(s) across ${files.length} pages.`);
  process.exit(1);
}
console.log(`Site check passed: ${files.length} pages, 0 errors.`);
