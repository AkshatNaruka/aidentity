#!/usr/bin/env node

/**
 * Zero-dependency static server for local preview.
 *   node site/serve.js [port]
 * Serves site/dist. Falls back to 404.html.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "dist");
const PORT = Number(process.argv[2]) || 4173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

if (!fs.existsSync(DIST)) {
  console.error("site/dist is missing. Run: node site/build.js");
  process.exit(1);
}

http
  .createServer((request, response) => {
    const url = decodeURIComponent((request.url || "/").split("?")[0]);
    let file = path.join(DIST, url);

    if (!file.startsWith(DIST)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, "index.html");
    }

    if (!fs.existsSync(file)) {
      const notFound = path.join(DIST, "404.html");
      response.writeHead(404, { "content-type": TYPES[".html"] });
      response.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : "Not found");
      return;
    }

    response.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    response.end(fs.readFileSync(file));
  })
  .listen(PORT, () => {
    console.log(`aidentity → http://localhost:${PORT}`);
  });
