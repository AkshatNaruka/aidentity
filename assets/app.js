// Progressive enhancement only. Every page works without JS.
(function () {
  "use strict";

  // --- copy install commands ---------------------------------------------
  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    const value = button.getAttribute("data-copy");
    if (!value) return;

    const done = function () {
      const original = button.textContent;
      button.textContent = "copied";
      window.setTimeout(function () {
        button.textContent = original;
      }, 1400);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(function () {});
      return;
    }

    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    try {
      document.execCommand("copy");
      done();
    } catch (error) {
      /* no-op */
    }
    document.body.removeChild(field);
  });

  // --- browse filtering ---------------------------------------------------
  const list = document.getElementById("skill-list");
  if (!list) return;

  const search = document.getElementById("q");
  const sourceFilter = document.getElementById("filter-source");
  const categoryFilter = document.getElementById("filter-category");
  const count = document.getElementById("result-count");
  const empty = document.getElementById("empty");
  const rows = Array.prototype.slice.call(list.querySelectorAll(".row"));

  const params = new URLSearchParams(window.location.search);
  if (search && params.get("q")) search.value = params.get("q");
  if (categoryFilter && params.get("category")) categoryFilter.value = params.get("category");
  if (sourceFilter && params.get("source")) sourceFilter.value = params.get("source");

  function apply() {
    const query = (search ? search.value : "").trim().toLowerCase();
    const source = sourceFilter ? sourceFilter.value : "";
    const category = categoryFilter ? categoryFilter.value : "";
    let visible = 0;

    rows.forEach(function (row) {
      const text = row.getAttribute("data-search") || "";
      const rowSource = row.getAttribute("data-source") || "";
      const rowCategory = row.getAttribute("data-category") || "";
      const match =
        (!query || text.indexOf(query) !== -1) &&
        (!source || rowSource === source) &&
        (!category || rowCategory === category);

      row.hidden = !match;
      if (match) visible += 1;
    });

    if (count) count.textContent = visible + (visible === 1 ? " skill" : " skills");
    if (empty) empty.hidden = visible !== 0;

    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (source) next.set("source", source);
    if (category) next.set("category", category);
    const suffix = next.toString();
    window.history.replaceState(null, "", window.location.pathname + (suffix ? "?" + suffix : ""));
  }

  [search, sourceFilter, categoryFilter].forEach(function (element) {
    if (!element) return;
    element.addEventListener("input", apply);
    element.addEventListener("change", apply);
  });

  apply();

  // --- keyboard: "/" focuses search --------------------------------------
  document.addEventListener("keydown", function (event) {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = (event.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (!search) return;
    event.preventDefault();
    search.focus();
  });
})();
