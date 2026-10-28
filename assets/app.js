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

    const fallback = function () {
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      field.setSelectionRange(0, value.length);
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (error) {
        ok = false;
      }
      document.body.removeChild(field);
      if (ok) {
        done();
      } else {
        // Last resort: select the command so the user can copy it manually.
        const code = button.closest(".cmd") && button.closest(".cmd").querySelector("code");
        if (code && window.getSelection) {
          const range = document.createRange();
          range.selectNodeContents(code);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        button.textContent = "selected";
        window.setTimeout(function () {
          button.textContent = "copy";
        }, 2000);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(fallback);
      return;
    }
    fallback();
  });


  // --- rotating hero command ---------------------------------------------
  const rotator = document.querySelector(".cmd-rotate");
  if (rotator) {
    let commands = [];
    try {
      commands = JSON.parse(rotator.getAttribute("data-commands") || "[]");
    } catch (error) {
      commands = [];
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (commands.length > 1 && !reduce) {
      const code = rotator.querySelector("code");
      const button = rotator.querySelector("button");
      let index = 0;
      let timer = null;
      const show = function (next) {
        code.classList.add("swap");
        window.setTimeout(function () {
          code.textContent = next;
          if (button) button.setAttribute("data-copy", next);
          code.classList.remove("swap");
        }, 200);
      };
      const start = function () {
        timer = window.setInterval(function () {
          index = (index + 1) % commands.length;
          show(commands[index]);
        }, 3400);
      };
      const stop = function () {
        if (timer) window.clearInterval(timer);
        timer = null;
      };
      rotator.addEventListener("mouseenter", stop);
      rotator.addEventListener("mouseleave", start);
      rotator.addEventListener("focusin", stop);
      rotator.addEventListener("focusout", start);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else if (!timer) start();
      });
      start();
    }
  }

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
