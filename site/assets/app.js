// Progressive enhancement only. Every page works without JS.
(function () {
  "use strict";

  const APP_SCRIPT_URL =
    (document.currentScript && document.currentScript.src) ||
    (document.querySelector('script[src*="assets/app.js"]') || {}).src ||
    window.location.href;
  // Read before the browse filter rewrites the URL via history.replaceState.
  const WANTS_SEARCH_FOCUS = new URLSearchParams(window.location.search).get("focus") === "1";

  // --- copy install commands & modern copy components -----------------------
  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-copy], [data-copy-target]");
    if (!button) return;
    let value = button.getAttribute("data-copy");
    if (!value && button.getAttribute("data-copy-target")) {
      const targetElem = document.querySelector(button.getAttribute("data-copy-target"));
      if (targetElem) value = targetElem.innerText || targetElem.textContent;
    }
    if (!value) return;

    const copyTextElem = button.querySelector(".copy-text");
    // Capture the pristine markup once. Re-reading innerHTML on a second click
    // inside the feedback window would capture "Copied" and never restore.
    if (!button.__copyOriginal) button.__copyOriginal = button.innerHTML;
    const originalHTML = button.__copyOriginal;
    window.clearTimeout(button.__copyTimer);

    const done = function () {
      button.classList.add("copied");
      const svg = button.querySelector("svg");
      if (svg) {
        svg.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        if (copyTextElem) {
          copyTextElem.textContent = "Copied";
        }
      } else {
        if (copyTextElem) {
          copyTextElem.textContent = "Copied ✓";
        } else {
          button.textContent = "Copied ✓";
        }
      }
      button.__copyTimer = window.setTimeout(function () {
        button.classList.remove("copied");
        button.innerHTML = originalHTML;
      }, 1800);
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
        const code = button.closest(".cmd") && button.closest(".cmd").querySelector("code");
        if (code && window.getSelection) {
          const range = document.createRange();
          range.selectNodeContents(code);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        button.textContent = "selected";
        button.__copyTimer = window.setTimeout(function () {
          button.innerHTML = originalHTML;
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
      // Prioritize top skills, but shuffle the subsequent pool randomly so every session gets fresh discoveries from the entire collection
      const priorityCount = 6;
      const head = commands.slice(0, priorityCount);
      const tail = commands.slice(priorityCount);
      for (let i = tail.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = tail[i];
        tail[i] = tail[j];
        tail[j] = temp;
      }
      commands = head.concat(tail);

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
      let paused = false;
      const start = function () {
        // Guard: hover + focus leave events can both fire; never stack intervals.
        if (timer || paused || document.hidden) return;
        timer = window.setInterval(function () {
          index = (index + 1) % commands.length;
          show(commands[index]);
        }, 3400);
      };
      const stop = function () {
        if (timer) window.clearInterval(timer);
        timer = null;
      };
      const pause = function () {
        paused = true;
        stop();
      };
      const resume = function () {
        if (rotator.matches(":hover") || rotator.contains(document.activeElement)) return;
        paused = false;
        start();
      };
      rotator.addEventListener("mouseenter", pause);
      rotator.addEventListener("mouseleave", resume);
      rotator.addEventListener("focusin", pause);
      rotator.addEventListener("focusout", function () {
        // activeElement is updated after focusout; defer the check.
        window.setTimeout(resume, 0);
      });
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else start();
      });
      start();
    }
  }

  // --- interactive role setup onboarding wizard --------------------------
  const builder = document.getElementById("setup-builder");
  if (builder) {
    let wizard = { plans: {}, focusPresets: {}, stackPresets: {}, extraSkillsCatalog: {} };
    try {
      const rawWizard = builder.getAttribute("data-wizard");
      if (rawWizard) {
        wizard = JSON.parse(rawWizard);
      } else {
        wizard.plans = JSON.parse(builder.getAttribute("data-plans") || "{}");
      }
    } catch (error) {
      wizard = { plans: {}, focusPresets: {}, stackPresets: {}, extraSkillsCatalog: {} };
    }

    const plans = wizard.plans || {};
    const focusPresets = wizard.focusPresets || {};
    const stackPresets = wizard.stackPresets || {};
    const extraSkillsCatalog = wizard.extraSkillsCatalog || {};

    const roleSelect = document.getElementById("setup-role");
    const profileSelect = document.getElementById("setup-profile");
    const stackSelect = document.getElementById("setup-stack");
    const focusSelect = document.getElementById("setup-focus");
    const agentSelect = document.getElementById("setup-agent");
    const quickRoleButtons = Array.prototype.slice.call(builder.querySelectorAll("[data-QuickRole]"));

    const cmdCode = document.getElementById("setup-cmd-code");
    const cmdCopy = document.getElementById("setup-cmd-copy");
    const promptPre = document.getElementById("setup-prompt-code");
    const promptCopy = document.getElementById("setup-prompt-copy");
    const promptTitle = document.getElementById("setup-prompt-title");
    const summaryText = document.getElementById("setup-summary-text");

    const buildCustomPrompt = function (entry, options) {
      const roleName = entry.roleName;
      const profileName = options.profile === "enterprise" ? "Enterprise" : "Individual";
      const isEnterprise = options.profile === "enterprise";
      const agent = options.agent;
      const focusPreset = focusPresets[options.focus] || { label: "Role Default", extraSkills: [], extraAgents: [] };
      const stackPreset = stackPresets[options.stack] || { label: "Role Default", rules: [] };

      // Merge skills (role + profile + focus) without duplicates
      const skillMap = new Map();
      (entry.skills || []).forEach(function (s) {
        skillMap.set(s.id, s);
      });
      (focusPreset.extraSkills || []).forEach(function (id) {
        if (!skillMap.has(id) && extraSkillsCatalog[id]) {
          skillMap.set(id, extraSkillsCatalog[id]);
        }
      });
      const mergedSkills = Array.from(skillMap.values());

      // Merge rules based on selected stack
      let mergedRules = [];
      if (options.stack === "none") {
        mergedRules = [];
      } else if (options.stack === "role" || !stackPreset.rules || !stackPreset.rules.length) {
        mergedRules = (entry.rules || []).slice();
      } else {
        // If user explicitly picked a single language stack, prioritize that stack's rules
        mergedRules = stackPreset.rules.slice();
        (entry.rules || []).forEach(function (r) {
          if (mergedRules.indexOf(r) === -1 && options.stack === "fullstack") {
            mergedRules.push(r);
          }
        });
      }

      // Merge subagents
      const agentSet = new Set((entry.agents || []).concat(focusPreset.extraAgents || []));
      const mergedAgents = Array.from(agentSet);
      const mergedHooks = (entry.hooks || []).slice();

      const focusFlag =
        options.focus !== "default" ? ' --task "' + focusPreset.label.toLowerCase() + '"' : "";
      const cliCmd =
        "npx aidentity setup " +
        entry.roleSlug +
        " --profile " +
        options.profile +
        " --agent " +
        agent +
        focusFlag;

      const skillLines = mergedSkills
        .map(function (s) {
          const sec = s.security || {};
          const sha = sec.sha256 ? " · sha256:" + sec.sha256 : "";
          return (
            "  - `" +
            s.id +
            "` (" +
            s.license +
            " · security: " +
            (sec.status || "verified") +
            sha +
            "): " +
            s.description
          );
        })
        .join("\n");

      const ruleLines = mergedRules.length
        ? mergedRules.map(function (r) { return "  - `" + r + "`"; }).join("\n")
        : "  - None required for this stack (use project conventions)";

      const agentLines = mergedAgents.length
        ? mergedAgents.map(function (a) { return "  - `" + a + "`"; }).join("\n")
        : "  - None required";

      const hookLines = mergedHooks.length
        ? mergedHooks.map(function (h) { return "  - `" + h + "`"; }).join("\n")
        : "  - `hooks/scan-secrets.js`";

      const contextHeader = [
        "- **Role**: " + roleName + " (" + entry.roleDescription + ")",
        "- **Organization Profile**: " + profileName,
        "- **Primary Stack**: " + (stackPreset.label || "Role Default"),
        "- **Primary Focus**: " + (focusPreset.label || "Role Default"),
        "- **Target Agent**: `" + agent + "`",
      ].join("\n");

      const promptText =
        "# Aidentity One-Time Initial Setup: " +
        roleName +
        " (" +
        profileName +
        ")\n\n" +
        "Set up my AI coding agent environment once based on my onboarding profile:\n" +
        contextHeader +
        "\n\n" +
        "## 1. One-Command Automated Setup (Preferred)\n" +
        "If you have shell access in this workspace, run:\n" +
        "```bash\n" +
        cliCmd +
        "\n```\n\n" +
        "## 2. Security & Provenance Gate (Mandatory)\n" +
        "Before installing or loading any skill, rule, or hook:\n" +
        '1. Verify against `https://akshatnaruka.github.io/aidentity/security.json` (or local `registry/security.json`) that `verified === true` and `risk_level === "safe"`.\n' +
        '2. Never install any skill where `distributable === false`, `content_url === null`, or `status !== "stable"`.\n' +
        "3. State the upstream author, SPDX license, and SHA-256 verification status before installing.\n" +
        (isEnterprise
          ? "4. **Enterprise Governance**: Enable all pre-tool security hooks (`block-dangerous.js`, `scan-secrets.js`), post-edit formatting (`format-on-save.js`), and test verification (`test-on-stop.js`). Require security and supply-chain review before shipping."
          : "4. **Individual Guardrails**: Enable `block-dangerous.js` and `scan-secrets.js` to prevent accidental destructive commands or credential leaks.") +
        "\n\n" +
        "## 3. Verified Skills to Install (" +
        mergedSkills.length +
        ")\n" +
        "Install with `npx aidentity add <id> --agent " +
        agent +
        "`:\n" +
        skillLines +
        "\n\n" +
        "## 4. Coding & Workflow Rules (" +
        mergedRules.length +
        ")\n" +
        "Copy into your agent's rules directory or `AGENTS.md`:\n" +
        ruleLines +
        "\n\n" +
        "## 5. Scoped Subagents & Guardrail Hooks\n" +
        "- Subagents:\n" +
        agentLines +
        "\n- Guardrail Hooks:\n" +
        hookLines;

      return {
        cliCmd: cliCmd,
        promptText: promptText,
        skillsCount: mergedSkills.length,
        rulesCount: mergedRules.length,
        agentsCount: mergedAgents.length,
        hooksCount: mergedHooks.length,
        title:
          roleName +
          " · " +
          profileName +
          (options.focus !== "default" ? " · " + focusPreset.label : "") +
          " Setup Prompt",
      };
    };

    const updateBuilder = function () {
      const role = roleSelect ? roleSelect.value : "founder";
      const profile = profileSelect ? profileSelect.value : "individual";
      const stack = stackSelect ? stackSelect.value : "role";
      const focus = focusSelect ? focusSelect.value : "default";
      const agent = agentSelect ? agentSelect.value : "claude";
      const key = role + ":" + profile;
      const entry = plans[key];
      if (!entry) return;

      quickRoleButtons.forEach(function (btn) {
        const isMatch = btn.getAttribute("data-QuickRole") === role;
        btn.classList.toggle("active", isMatch);
      });

      const built = buildCustomPrompt(entry, {
        role: role,
        profile: profile,
        stack: stack,
        focus: focus,
        agent: agent,
      });

      if (cmdCode) cmdCode.textContent = built.cliCmd;
      if (cmdCopy) cmdCopy.setAttribute("data-copy", built.cliCmd);
      if (promptPre) promptPre.textContent = built.promptText;
      if (promptCopy) promptCopy.setAttribute("data-copy", built.promptText);
      if (promptTitle) promptTitle.textContent = built.title;
      if (summaryText) {
        summaryText.textContent =
          built.skillsCount +
          " verified skills · " +
          built.rulesCount +
          " rules · " +
          built.agentsCount +
          " subagents · " +
          built.hooksCount +
          " safety hooks · each skill scanned, SHA-256 published";
      }
    };

    quickRoleButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const targetRole = btn.getAttribute("data-QuickRole");
        if (roleSelect && targetRole) {
          roleSelect.value = targetRole;
          updateBuilder();
        }
      });
    });

    [roleSelect, profileSelect, stackSelect, focusSelect, agentSelect].forEach(function (el) {
      if (el) {
        el.addEventListener("change", updateBuilder);
        el.addEventListener("input", updateBuilder);
      }
    });
    updateBuilder();
  }

  // --- browse filtering & enhanced search --------------------------------
  const list = document.getElementById("skill-list");
  if (list) {
    const search = document.getElementById("q");
    const searchClearBtn = document.getElementById("search-clear-btn");
    const sourceFilter = document.getElementById("filter-source");
    const categoryFilter = document.getElementById("filter-category");
    const sortFilter = document.getElementById("filter-sort");
    const distFilterBtn = document.getElementById("filter-dist-btn");
    const clearAllBtn = document.getElementById("clear-all-filters");
    const emptyClearBtn = document.getElementById("empty-clear-btn");
    const count = document.getElementById("result-count");
    const empty = document.getElementById("empty");
    const pillStrip = document.getElementById("category-pills");
    const pillButtons = pillStrip ? Array.prototype.slice.call(pillStrip.querySelectorAll(".pill-btn")) : [];

    let onlyDistributable = false;
    let lastSortMode = "default";
    const initialRows = Array.prototype.slice.call(list.querySelectorAll(".row"));

    const params = new URLSearchParams(window.location.search);
    if (search && params.get("q")) search.value = params.get("q");
    if (categoryFilter && params.get("category")) categoryFilter.value = params.get("category");
    if (sourceFilter && params.get("source")) sourceFilter.value = params.get("source");
    if (sortFilter && params.get("sort")) sortFilter.value = params.get("sort");
    if (params.get("distributable") === "1" || params.get("installable") === "1") {
      onlyDistributable = true;
      if (distFilterBtn) {
        distFilterBtn.classList.add("active");
        distFilterBtn.setAttribute("aria-pressed", "true");
      }
    }

    function syncPills() {
      const activeCat = (categoryFilter ? categoryFilter.value : "").trim().toLowerCase();
      const currentQuery = (search ? search.value : "").trim().toLowerCase();
      let hasSpecific = false;

      pillButtons.forEach(function (btn) {
        const cat = btn.getAttribute("data-cat");
        const query = btn.getAttribute("data-query");
        let isActive = false;
        if (cat !== null && cat !== "") {
          isActive = Boolean(activeCat && cat.toLowerCase() === activeCat && !currentQuery);
        } else if (query) {
          isActive = Boolean(currentQuery && currentQuery === query.toLowerCase() && !activeCat);
        }
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        if (isActive) hasSpecific = true;
      });

      const allBtn = pillButtons.filter(function (b) {
        return b.getAttribute("data-cat") === "" && !b.getAttribute("data-query");
      })[0];
      if (allBtn) {
        const allActive = !hasSpecific && !activeCat && !currentQuery;
        allBtn.classList.toggle("active", allActive);
        allBtn.setAttribute("aria-pressed", allActive ? "true" : "false");
      }
    }

    function sortRows(rows, sortMode) {
      if (sortMode === "name-asc") {
        return rows.slice().sort(function (a, b) {
          const na = a.getAttribute("data-name") || "";
          const nb = b.getAttribute("data-name") || "";
          return na.localeCompare(nb);
        });
      } else if (sortMode === "name-desc") {
        return rows.slice().sort(function (a, b) {
          const na = a.getAttribute("data-name") || "";
          const nb = b.getAttribute("data-name") || "";
          return nb.localeCompare(na);
        });
      }
      return initialRows;
    }

    function apply() {
      const rawQuery = (search ? search.value : "").trim().toLowerCase();
      const tokens = rawQuery.split(/\s+/).filter(Boolean);
      const source = sourceFilter ? sourceFilter.value : "";
      const category = categoryFilter ? categoryFilter.value : "";
      const sortMode = sortFilter ? sortFilter.value : "default";

      if (searchClearBtn) {
        searchClearBtn.hidden = !rawQuery;
      }

      const hasActiveFilter = Boolean(rawQuery || source || category || onlyDistributable || (sortMode && sortMode !== "default"));
      if (clearAllBtn) {
        clearAllBtn.hidden = !hasActiveFilter;
      }

      let visible = 0;
      const sorted = sortRows(initialRows, sortMode);
      // Re-appending 500+ rows forces layout; only reorder when the sort changes.
      const reorder = sortMode !== lastSortMode;
      lastSortMode = sortMode;
      const fragment = reorder ? document.createDocumentFragment() : null;

      sorted.forEach(function (row) {
        const text = row.getAttribute("data-search") || "";
        const rowSource = row.getAttribute("data-source") || "";
        const rowCategory = row.getAttribute("data-category") || "";
        const isDist = row.getAttribute("data-distributable") === "1";

        const matchQuery = tokens.length === 0 || tokens.every(function (token) {
          return text.indexOf(token) !== -1;
        });
        const matchSource = !source || rowSource === source;
        const matchCategory = !category || rowCategory === category;
        const matchDist = !onlyDistributable || isDist;

        const match = matchQuery && matchSource && matchCategory && matchDist;
        row.hidden = !match;
        if (match) visible += 1;

        if (fragment) fragment.appendChild(row);
      });
      if (fragment) list.appendChild(fragment);

      if (count) {
        count.innerHTML = "<strong>" + visible + "</strong> " + (visible === 1 ? "skill" : "skills") + " available";
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }

      syncPills();

      const next = new URLSearchParams();
      if (rawQuery) next.set("q", rawQuery);
      if (source) next.set("source", source);
      if (category) next.set("category", category);
      if (sortMode && sortMode !== "default") next.set("sort", sortMode);
      if (onlyDistributable) next.set("distributable", "1");
      const suffix = next.toString();
      window.history.replaceState(null, "", window.location.pathname + (suffix ? "?" + suffix : ""));
    }

    function resetFilters() {
      if (search) search.value = "";
      if (categoryFilter) categoryFilter.value = "";
      if (sourceFilter) sourceFilter.value = "";
      if (sortFilter) sortFilter.value = "default";
      onlyDistributable = false;
      if (distFilterBtn) {
        distFilterBtn.classList.remove("active");
        distFilterBtn.setAttribute("aria-pressed", "false");
      }
      apply();
      if (search) search.focus();
    }

    [search, sourceFilter, categoryFilter, sortFilter].forEach(function (element) {
      if (!element) return;
      element.addEventListener("input", apply);
      element.addEventListener("change", apply);
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener("click", function () {
        if (search) {
          search.value = "";
          search.focus();
        }
        apply();
      });
    }

    if (distFilterBtn) {
      distFilterBtn.addEventListener("click", function () {
        onlyDistributable = !onlyDistributable;
        distFilterBtn.classList.toggle("active", onlyDistributable);
        distFilterBtn.setAttribute("aria-pressed", onlyDistributable ? "true" : "false");
        apply();
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", resetFilters);
    }
    if (emptyClearBtn) {
      emptyClearBtn.addEventListener("click", resetFilters);
    }

    pillButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const cat = btn.getAttribute("data-cat");
        const query = btn.getAttribute("data-query");

        if (cat !== null) {
          if (cat === "") {
            // "All" clicked
            if (categoryFilter) categoryFilter.value = "";
            if (search) search.value = "";
          } else {
            // Toggle category filter
            if (categoryFilter) {
              categoryFilter.value = (categoryFilter.value.toLowerCase() === cat.toLowerCase()) ? "" : cat;
            }
            if (search) search.value = "";
          }
          apply();
        } else if (query) {
          // Toggle query filter
          if (search) {
            const current = search.value.trim().toLowerCase();
            search.value = (current === query.toLowerCase()) ? "" : query;
          }
          if (categoryFilter) categoryFilter.value = "";
          apply();
          if (search && search.value) search.focus();
        }
      });
    });

    // "/" and Cmd/Ctrl+K are handled globally by triggerSearch() below.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && search && document.activeElement === search) {
        if (search.value) {
          search.value = "";
          apply();
        } else {
          search.blur();
        }
      }
    });

    apply();
  }

  // --- playbook domain filtering ------------------------------------------
  const playbookGrid = document.querySelector(".playbook-grid");
  if (playbookGrid) {
    const filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-playbook-filter], [data-PlaybookFilter]"));
    const cards = Array.prototype.slice.call(playbookGrid.querySelectorAll(".playbook-card"));

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const filter = btn.getAttribute("data-playbook-filter") || btn.getAttribute("data-PlaybookFilter") || "all";
        filterButtons.forEach(function (b) {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });

        cards.forEach(function (card) {
          const domain = card.getAttribute("data-domain") || "";
          if (filter === "all" || domain.indexOf(filter) !== -1) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // --- Navbar Sticky Blur on Scroll -------------------------------------
  const siteHead = document.getElementById("site-head");
  if (siteHead) {
    const handleScroll = function () {
      if (window.pageYOffset > 10) {
        siteHead.classList.add("scrolled");
      } else {
        siteHead.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  // --- Mobile Navigation Drawer ------------------------------------------
  const mobileToggle = document.getElementById("nav-mobile-toggle");
  const siteNav = document.getElementById("site-nav");
  if (mobileToggle && siteNav) {
    mobileToggle.addEventListener("click", function () {
      const isOpen = siteNav.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    const closeNav = function () {
      siteNav.classList.remove("open");
      mobileToggle.setAttribute("aria-expanded", "false");
    };
    document.addEventListener("click", function (e) {
      if (!siteNav.contains(e.target) && !mobileToggle.contains(e.target)) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && siteNav.classList.contains("open")) {
        closeNav();
        mobileToggle.focus();
      }
    });
  }

  // --- Quick Search Trigger & Shortcuts (⌘K & /) --------------------------
  function triggerSearch() {
    const search = document.getElementById("q");
    if (search) {
      search.focus();
      search.select();
    } else {
      // Resolve against this script's URL (always <site>/assets/app.js), so it
      // works from any depth, including nested skill pages.
      window.location.href = new URL("../skills/index.html?focus=1", APP_SCRIPT_URL).href;
    }
  }

  const searchTrigger = document.getElementById("nav-search-trigger");
  if (searchTrigger) {
    searchTrigger.addEventListener("click", triggerSearch);
  }

  document.addEventListener("keydown", function (event) {
    const isCmdK = (event.metaKey || event.ctrlKey) && (event.key === "k" || event.key === "K");
    const isSlash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
    if (!isCmdK && !isSlash) return;

    const tag = (event.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    event.preventDefault();
    triggerSearch();
  });

  // Focus search if URL query contains focus=1
  if (WANTS_SEARCH_FOCUS) {
    const search = document.getElementById("q");
    if (search) {
      window.setTimeout(function () {
        search.focus();
        search.select();
      }, 50);
    }
  }

  // --- Back to Top --------------------------------------------------------
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  // --- Ambient Footer WebGL Shader (21st.dev style) -----------------------
  (function initFooterShader() {
    const canvas = document.getElementById("footer-shader-canvas");
    const foot = document.getElementById("site-foot");
    if (!canvas || !foot) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" }) ||
               canvas.getContext("experimental-webgl", { alpha: true, antialias: false });
    if (!gl) return;

    const VERT = "attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }";
    const FRAG = [
      "precision mediump float;",
      "uniform vec2 u_resolution;",
      "uniform float u_time;",
      "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
      "float noise(vec2 p) {",
      "  vec2 i = floor(p); vec2 f = fract(p);",
      "  vec2 u = f * f * (3.0 - 2.0 * f);",
      "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),",
      "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
      "}",
      "void main() {",
      "  vec2 uv = gl_FragCoord.xy / u_resolution.xy;",
      "  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);",
      "  float n = noise(p * 2.5 + vec2(u_time * 0.05, u_time * 0.03));",
      "  float wave = sin(uv.x * 3.5 + u_time * 0.35 + n * 2.2) * 0.5 + 0.5;",
      "  vec3 dark = vec3(0.05, 0.045, 0.04);",
      "  vec3 crimson = vec3(0.52, 0.12, 0.07);",
      "  vec3 amber = vec3(0.85, 0.45, 0.1);",
      "  vec3 col = mix(dark, crimson, wave * 0.5);",
      "  col = mix(col, amber, pow(n * wave, 3.5) * 0.35);",
      "  float alpha = smoothstep(0.0, 0.85, uv.y) * 0.65;",
      "  gl_FragColor = vec4(col, alpha);",
      "}"
    ].join("\n");

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FRAG);
    gl.compileShader(fs);

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uTime = gl.getUniformLocation(prog, "u_time");

    let isVisible = false;
    let rafId = 0;
    let width = 0, height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = foot.clientWidth;
      const h = foot.clientHeight;
      if (width !== w || height !== h) {
        width = w;
        height = h;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }
    window.addEventListener("resize", resize);
    resize();

    const t0 = performance.now();
    // Only keep a frame loop alive while the footer is on screen; an idle
    // rAF loop still wakes the main thread 60 times a second.
    function render(now) {
      if (!isVisible) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(render);
      resize();
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    function setVisible(next) {
      isVisible = next;
      if (isVisible && !rafId) rafId = requestAnimationFrame(render);
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        setVisible(entries[0].isIntersecting);
      }, { threshold: 0.05 });
      observer.observe(foot);
    } else {
      setVisible(true);
    }
  })();

  // --- Setup Preset Cards -----------------------------------------------
  // Previously targeted #wiz-role / #wiz-profile / #wizard-output, which do not
  // exist, so clicking a preset did nothing. The wizard uses #setup-*.
  const presets = Array.prototype.slice.call(document.querySelectorAll("[data-preset-role]"));
  const applyPreset = function (preset) {
    const role = preset.getAttribute("data-preset-role");
    const profile = preset.getAttribute("data-preset-profile") || "individual";
    const roleSelect = document.getElementById("setup-role");
    const profileSelect = document.getElementById("setup-profile");
    if (profileSelect) profileSelect.value = profile;
    if (roleSelect) {
      roleSelect.value = role;
      roleSelect.dispatchEvent(new Event("change"));
    }
    presets.forEach(function (p) {
      p.classList.toggle("active", p === preset);
      p.setAttribute("aria-pressed", p === preset ? "true" : "false");
    });
    const outputElem = document.getElementById("setup-builder");
    if (outputElem) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      outputElem.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };
  presets.forEach(function (preset) {
    preset.addEventListener("click", function () {
      applyPreset(preset);
    });
    preset.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        applyPreset(preset);
      }
    });
  });

  // --- Card Spotlight Initializer -----------------------------------------
  document.querySelectorAll(".playbook-card, .role-card, .aside-card, .three div, .bento-card, .preset-card").forEach(function (card) {
    card.classList.add("spotlight-card");
  });
})();

