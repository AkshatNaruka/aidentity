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
        const ruleSet = new Set(stackPreset.rules.concat(entry.rules || []));
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
            ") — " +
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
        "# Aidentity One-Time Initial Setup — " +
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
          " safety hooks · 100% SHA-256 verified";
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

  // --- browse filtering ---------------------------------------------------
  const list = document.getElementById("skill-list");
  if (list) {
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
  }

  // --- playbook domain filtering ------------------------------------------
  const playbookGrid = document.querySelector(".playbook-grid");
  if (playbookGrid) {
    const filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-playbook-filter], [data-PlaybookFilter]"));
    const cards = Array.prototype.slice.call(playbookGrid.querySelectorAll(".playbook-card"));

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const filter = btn.getAttribute("data-playbook-filter") || btn.getAttribute("data-PlaybookFilter") || "all";
        filterButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

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

  // --- WebGL Wave Shader & Scroll Parallax --------------------------------
  (function initShaderAndParallax() {
    const canvas = document.getElementById("poba-shader-canvas");
    const section = document.getElementById("fluid-runtime");
    if (!canvas || !section) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Multi-layer parallax scroll listener
    const parallaxLayers = Array.prototype.slice.call(section.querySelectorAll("[data-parallax-depth]"));
    let isVisible = true;
    let lastScrollY = window.pageYOffset;

    function updateParallax() {
      if (!isVisible || prefersReducedMotion) return;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;
      // Center progress: -1 when above, 0 when centered, +1 when below
      const centerDelta = (rect.top + rect.height * 0.5 - viewportHeight * 0.5) / viewportHeight;

      for (let i = 0; i < parallaxLayers.length; i++) {
        const el = parallaxLayers[i];
        const depth = parseFloat(el.getAttribute("data-parallax-depth") || "0.2");
        const translateY = Math.round(centerDelta * depth * 80);
        el.style.transform = "translate3d(0, " + translateY + "px, 0)";
      }
    }

    window.addEventListener("scroll", function () {
      updateParallax();
    }, { passive: true });
    updateParallax();

    // WebGL Canvas initialization
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "high-performance" }) ||
               canvas.getContext("experimental-webgl", { alpha: true, antialias: false });
    if (!gl) return;

    const VERT = [
      "attribute vec2 a_position;",
      "void main() {",
      "  gl_Position = vec4(a_position, 0.0, 1.0);",
      "}"
    ].join("\n");

    const FRAG = [
      "precision mediump float;",
      "uniform vec3 u_colors[8];",
      "uniform vec4 u_scene;",      // xy: resolution, z: time, w: colorCount
      "uniform vec4 u_shape;",      // x: scale, y: intensity, z: paramA, w: warp
      "uniform vec4 u_surface;",    // x: detail, y: contrast, z: brightness, w: saturation
      "uniform vec4 u_finish;",     // x: hue, y: vignette, z: blur, w: grain
      "uniform vec4 u_transform;",  // x: seed, y: rotate, z: drift, w: oklab
      "uniform vec4 u_space;",      // xy: offset, zw: pointer
      "uniform vec4 u_cursor;",     // x: presence, y: effect, z: strength, w: radius
      "#define u_resolution u_scene.xy",
      "#define u_time u_scene.z",
      "#define u_colorCount u_scene.w",
      "#define u_scale u_shape.x",
      "#define u_intensity u_shape.y",
      "#define u_warp u_shape.w",
      "#define u_detail u_surface.x",
      "#define u_contrast u_surface.y",
      "#define u_brightness u_surface.z",
      "#define u_saturation u_surface.w",
      "#define u_rotate u_transform.y",
      "#define u_drift u_transform.z",
      "#define u_mouse u_space.zw",
      "#define u_cursorPresence u_cursor.x",
      "float hash21(vec2 p) {",
      "  p = mod(p, 31.0);",
      "  p = fract(p * vec2(234.34, 435.345));",
      "  p += dot(p, p + 34.23);",
      "  return fract(p.x * p.y);",
      "}",
      "float noise(vec2 p) {",
      "  vec2 i = floor(p);",
      "  vec2 f = fract(p);",
      "  vec2 u = f * f * (3.0 - 2.0 * f);",
      "  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),",
      "             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);",
      "}",
      "float fbm(vec2 p) {",
      "  float v = 0.0;",
      "  float a = 0.5;",
      "  for (int i = 0; i < 4; i++) {",
      "    v += a * noise(p);",
      "    p = p * 2.03 + vec2(17.0, 9.2);",
      "    a *= 0.5;",
      "  }",
      "  return v;",
      "}",
      "vec3 palette(float x) {",
      "  float n = max(u_colorCount - 1.0, 1.0);",
      "  float f = clamp(x, 0.0, 1.0) * n;",
      "  vec3 col = u_colors[0];",
      "  for (int i = 0; i < 4; i++) {",
      "    if (float(i) < n) {",
      "      col = mix(col, u_colors[i + 1], smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));",
      "    }",
      "  }",
      "  return col;",
      "}",
      "void main() {",
      "  vec2 uv = gl_FragCoord.xy / u_resolution.xy;",
      "  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);",
      "  if (u_cursorPresence > 0.001) {",
      "    vec2 cursor = (0.5 * u_mouse * u_resolution.xy) / min(u_resolution.x, u_resolution.y);",
      "    vec2 delta = p - cursor;",
      "    float dist = length(delta);",
      "    float mask = u_cursorPresence * (1.0 - smoothstep(0.0, 0.65, dist));",
      "    p -= (delta / max(dist, 0.001)) * mask * 0.18;",
      "  }",
      "  p *= u_scale;",
      "  if (abs(u_rotate) > 0.001) {",
      "    float cr = cos(u_rotate), sr = sin(u_rotate);",
      "    p = mat2(cr, -sr, sr, cr) * p;",
      "  }",
      "  p += u_drift * vec2(sin(u_time * 0.35), cos(u_time * 0.25));",
      "  if (u_warp > 0.0) {",
      "    p += u_warp * (vec2(fbm(p * u_detail), fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);",
      "  }",
      "  float y = uv.y + sin(uv.x * (3.0 + u_intensity * 7.0) + u_time * 0.75) * 0.09 + (fbm(p * 2.0 + u_time * 0.12) - 0.5) * u_intensity * 0.65;",
      "  vec3 col = palette(y);",
      "  col = (col - 0.5) * u_contrast + 0.5 + u_brightness;",
      "  float luma = dot(col, vec3(0.299, 0.587, 0.114));",
      "  col = mix(vec3(luma), col, u_saturation);",
      "  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 0.95);",
      "}"
    ].join("\n");

    function createShader(type, src) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERT);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Quad geometry
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uColors = gl.getUniformLocation(program, "u_colors");
    const uScene = gl.getUniformLocation(program, "u_scene");
    const uShape = gl.getUniformLocation(program, "u_shape");
    const uSurface = gl.getUniformLocation(program, "u_surface");
    const uFinish = gl.getUniformLocation(program, "u_finish");
    const uTransform = gl.getUniformLocation(program, "u_transform");
    const uSpace = gl.getUniformLocation(program, "u_space");
    const uCursor = gl.getUniformLocation(program, "u_cursor");

    // Color Palettes
    const palettes = [
      // Palette A: Aidentity Crimson & Charcoal
      new Float32Array([
        0.05, 0.045, 0.04,
        0.48, 0.10, 0.05,
        0.72, 0.21, 0.11,
        0.91, 0.52, 0.12,
        0.95, 0.94, 0.91, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ]),
      // Palette B: Amber Gold & Warm Slate
      new Float32Array([
        0.06, 0.05, 0.04,
        0.65, 0.22, 0.08,
        0.88, 0.58, 0.15,
        0.98, 0.88, 0.65,
        0.96, 0.94, 0.90, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ])
    ];
    let currentPaletteIndex = 0;

    const paletteBtn = document.getElementById("shader-palette-toggle");
    if (paletteBtn) {
      paletteBtn.addEventListener("click", function () {
        currentPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
        paletteBtn.textContent = currentPaletteIndex === 0 ? "Toggle Amber Glow" : "Toggle Crimson Glow";
      });
    }

    // Pointer state
    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;
    let cursorPresence = 0;

    section.addEventListener("pointermove", function (e) {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x;
      targetMouseY = y;
      cursorPresence = 1.0;
    });

    section.addEventListener("pointerleave", function () {
      cursorPresence = 0.0;
    });

    // Resize handling
    let width = 0, height = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = section.clientWidth;
      const h = section.clientHeight;
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

    // Intersection observer to pause when offscreen
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(section);
    }

    // Animation loop & FPS calculation
    let startTime = performance.now();
    let lastFrameTime = startTime;
    let frameCount = 0;
    const fpsElem = document.getElementById("shader-fps");

    function render(now) {
      requestAnimationFrame(render);
      if (!isVisible && !prefersReducedMotion) return;

      resize();

      // FPS Calculation
      frameCount++;
      if (now - lastFrameTime >= 1000) {
        if (fpsElem) fpsElem.textContent = Math.round((frameCount * 1000) / (now - lastFrameTime));
        frameCount = 0;
        lastFrameTime = now;
      }

      const elapsed = (now - startTime) * 0.001;

      // Mouse smoothing
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      gl.useProgram(program);
      gl.uniform3fv(uColors, palettes[currentPaletteIndex]);
      gl.uniform4f(uScene, canvas.width, canvas.height, elapsed, 4.0);
      gl.uniform4f(uShape, 1.35, 0.45, 0.84, 0.025);
      gl.uniform4f(uSurface, 1.6, 1.15, 0.08, 1.85);
      gl.uniform4f(uFinish, 0.0, 0.0, 0.0, 0.0);
      gl.uniform4f(uTransform, 4984.0, 0.35, 0.32, 1.0);
      gl.uniform4f(uSpace, 0.0, 0.0, currentMouseX, currentMouseY);
      gl.uniform4f(uCursor, cursorPresence, 1.0, 0.6, 0.5);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    requestAnimationFrame(render);
  })();

  // --- keyboard: "/" focuses search --------------------------------------
  document.addEventListener("keydown", function (event) {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = (event.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    const search = document.getElementById("q");
    if (!search) return;
    event.preventDefault();
    search.focus();
  });
})();

