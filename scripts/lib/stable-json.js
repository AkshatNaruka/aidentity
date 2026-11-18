"use strict";
/**
 * Serialize a generated registry file deterministically.
 *
 * Generated files carry a `generated_at` date. If we stamp today's date on
 * every run, `--check` fails on any day after the last build and every rebuild
 * produces a date-only diff. Instead, reuse the previous date whenever the rest
 * of the content is identical.
 */
const fs = require("fs");

function serializeStable(file, data) {
  const previous = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const render = (obj) => JSON.stringify(obj, null, 2) + "\n";
  try {
    const prevDate = JSON.parse(previous).generated_at;
    if (prevDate && render({ ...data, generated_at: prevDate }) === previous) {
      data = { ...data, generated_at: prevDate };
    }
  } catch {
    /* first build or unreadable file: keep the new date */
  }
  return { previous, serialized: render(data) };
}

module.exports = { serializeStable };
