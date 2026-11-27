/**
 * Retrieval engine for the Aidentity registry.
 *
 * Zero dependencies. Builds a weighted inverted index once per process and
 * answers three questions:
 *
 *   search(query)      ranked skills, with the reason each one matched
 *   recommend(task)    the bundle that fits the task, plus specific skills
 *   suggest(query)     "did you mean" fallback when nothing matches
 *
 * The registry is a natural-language corpus: people ask for "postgres
 * migrations", not "database-migration". So the engine does plural/verb
 * stemming, synonym expansion, phrase boosting and BM25 ranking rather than
 * substring matching.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "skills.json"), "utf8"));
const bundleFile = path.join(ROOT, "bundles", "bundles.json");
const bundles = fs.existsSync(bundleFile)
  ? JSON.parse(fs.readFileSync(bundleFile, "utf8")).bundles
  : [];

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

const STOP = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can", "do",
  "does", "for", "from", "get", "had", "has", "have", "how", "i", "if", "in",
  "into", "is", "it", "its", "me", "my", "no", "not", "of", "on", "or", "our",
  "out", "so", "some", "than", "that", "the", "their", "them", "then", "there",
  "these", "they", "this", "to", "up", "was", "we", "were", "what", "when",
  "where", "which", "who", "will", "with", "you", "your",
  // Verbs that carry no domain meaning in a task description.
  "add", "build", "create", "help", "make", "need", "use", "using", "want",
  "work", "working", "write", "writing",
  // Nouns generic enough to appear in hundreds of descriptions.
  "flow", "post", "thing", "stuff", "way", "best", "good", "new", "like",
  "also", "just", "more", "most", "over", "very",
]);

/** Crude but effective English stemmer: plurals and common verb endings. */
function stem(word) {
  if (word.length <= 3) return word;
  if (/ies$/.test(word)) return `${word.slice(0, -3)}y`;
  if (/(sses|shes|ches|xes|zes)$/.test(word)) return word.slice(0, -2);
  if (/s$/.test(word) && !/ss$/.test(word)) return word.slice(0, -1);
  if (/ing$/.test(word) && word.length > 5) return word.slice(0, -3);
  if (/ed$/.test(word) && word.length > 4) return word.slice(0, -2);
  return word;
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((token) => token.replace(/^[.]+|[.]+$/g, ""))
    .filter((token) => token.length > 1 && !STOP.has(token))
    .map(stem)
    .filter(Boolean);
}

/** Kept for backwards compatibility with cli/lib/setup.js. */
const tokens = tokenize;

// ---------------------------------------------------------------------------
// Synonyms
// ---------------------------------------------------------------------------

// Groups of terms that mean the same thing to someone asking for a skill.
// Every member expands to every other member at reduced weight.
const SYNONYM_GROUPS = [
  ["postgres", "postgresql", "psql", "pg", "database", "db", "sql", "schema", "migration", "orm"],
  ["react", "nextjs", "next", "frontend", "front-end", "web", "webapp", "spa", "component", "ui"],
  ["expo", "react-native", "reactnative", "mobile", "ios", "android", "app", "native"],
  ["seo", "search-engine", "serp", "keyword", "ranking", "aeo", "geo", "llmo"],
  ["security", "audit", "vulnerability", "appsec", "pentest", "threat", "cve", "exploit", "hardening"],
  ["ci", "cd", "pipeline", "deploy", "deployment", "devops", "release", "github-action"],
  ["kubernetes", "k8s", "gke", "cluster", "helm", "container", "docker"],
  ["cloud", "gcp", "google-cloud", "aws", "azure", "cloud-run", "serverless", "infra", "infrastructure"],
  ["stripe", "billing", "payment", "checkout", "subscription", "invoice", "pricing", "monetization"],
  ["design", "ui", "ux", "interface", "layout", "visual", "typography", "aesthetic", "style"],
  ["test", "testing", "tdd", "qa", "spec", "coverage", "jest", "vitest", "playwright"],
  ["debug", "debugging", "bug", "fix", "troubleshoot", "diagnose", "error", "crash", "regression"],
  ["doc", "docs", "documentation", "readme", "writing", "prose", "guide", "tutorial"],
  ["git", "commit", "branch", "merge", "rebase", "pull-request", "pr", "version-control"],
  ["data", "analytics", "warehouse", "bigquery", "etl", "dataset", "metrics", "dashboard"],
  ["ai", "llm", "rag", "embedding", "vector", "prompt", "agent", "model", "inference", "eval"],
  ["copy", "copywriting", "marketing", "content", "blog", "article", "campaign", "newsletter"],
  ["email", "newsletter", "drip", "sequence", "outreach"],
  ["sales", "crm", "lead", "prospect", "pipeline", "deal", "outbound"],
  ["finance", "financial", "valuation", "dcf", "accounting", "revenue", "forecast", "budget"],
  ["quant", "trading", "backtest", "portfolio", "risk", "alpha", "market", "investment"],
  ["music", "audio", "lyric", "song", "mixing", "mastering", "beat", "melody"],
  ["film", "video", "screenplay", "script", "storyboard", "editing", "cinematography", "shot"],
  ["legal", "contract", "compliance", "gdpr", "privacy", "policy", "terms", "nda"],
  ["hr", "hiring", "recruiting", "people", "interview", "onboarding", "culture"],
  ["teach", "teacher", "education", "curriculum", "lesson", "course", "student", "learning"],
  ["product", "pm", "roadmap", "sprint", "scrum", "agile", "jira", "backlog", "story", "retrospective"],
  ["architecture", "architect", "system-design", "adr", "diagram", "scalability", "module"],
  ["performance", "perf", "latency", "optimize", "optimization", "profil", "speed", "bundle-size"],
  ["motion", "animation", "animate", "transition", "framer", "gsap", "keyframe"],
  ["accessibility", "a11y", "wcag", "aria", "screen-reader", "contrast"],
  ["refactor", "refactoring", "cleanup", "simplify", "restructure", "tech-debt"],
  ["api", "rest", "graphql", "endpoint", "http", "rpc", "openapi"],
  ["auth", "authentication", "authorization", "login", "oauth", "jwt", "session", "rbac"],
  ["research", "analysis", "report", "summary", "synthesis", "insight"],
  ["support", "customer", "ticket", "helpdesk", "chat", "response"],
  ["memory", "context", "token", "compression", "summarize", "retention"],
];

const SYNONYMS = (() => {
  const map = new Map();
  for (const group of SYNONYM_GROUPS) {
    const stemmed = [...new Set(group.map(stem))];
    for (const term of stemmed) {
      const set = map.get(term) || new Set();
      for (const other of stemmed) if (other !== term) set.add(other);
      map.set(term, set);
    }
  }
  return map;
})();

function expand(term, weight = 0.55) {
  const out = [[term, 1]];
  const related = SYNONYMS.get(term);
  if (related) for (const other of related) out.push([other, weight]);
  return out;
}

// ---------------------------------------------------------------------------
// Index
// ---------------------------------------------------------------------------

const K1 = 1.2;
const B = 0.72;

// Field weights: a term in the name is worth far more than a term buried in a
// 300-word description.
const FIELDS = [
  ["name", 4.0],
  ["tags", 2.6],
  ["category", 2.2],
  ["repo", 1.4],
  ["description", 1.0],
];

function buildIndex(skills) {
  const docs = skills.map((skill) => {
    const tf = new Map();
    for (const [field, weight] of FIELDS) {
      const value = field === "repo" ? skill.source.repo : skill[field];
      const text = Array.isArray(value) ? value.join(" ") : value;
      for (const token of tokenize(text)) {
        tf.set(token, (tf.get(token) || 0) + weight);
      }
    }
    let length = 0;
    for (const value of tf.values()) length += value;
    return { skill, tf, length, haystack: `${skill.name} ${skill.description} ${skill.category}`.toLowerCase() };
  });

  const df = new Map();
  for (const doc of docs) for (const term of doc.tf.keys()) df.set(term, (df.get(term) || 0) + 1);

  const avgLength = docs.reduce((sum, doc) => sum + doc.length, 0) / (docs.length || 1);
  return { docs, df, avgLength, total: docs.length };
}

const INDEX = buildIndex(registry.skills);

function idf(term) {
  const n = INDEX.df.get(term) || 0;
  return Math.log(1 + (INDEX.total - n + 0.5) / (n + 0.5));
}

function bm25(tf, length, term) {
  if (!tf) return 0;
  const norm = K1 * (1 - B + (B * length) / (INDEX.avgLength || 1));
  return (idf(term) * (tf * (K1 + 1))) / (tf + norm);
}

function matchedFields(skill, term) {
  const fields = [];
  if (tokenize(skill.name).includes(term)) fields.push("name");
  if (tokenize((skill.tags || []).join(" ")).includes(term)) fields.push("tags");
  if (tokenize(skill.category).includes(term)) fields.push("category");
  if (tokenize(skill.description).includes(term)) fields.push("description");
  return fields;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

function searchDetailed(query, { limit = 8, category, source, license, distributable } = {}) {
  const raw = String(query || "").trim().toLowerCase();
  const queryTokens = [...new Set(tokenize(raw))];
  if (!queryTokens.length) return [];

  // Expanded query terms: [term, weight]
  const weighted = [];
  for (const term of queryTokens) for (const [t, w] of expand(term)) weighted.push([t, w]);

  const phrase = raw.replace(/\s+/g, " ");

  const scored = INDEX.docs
    .map((doc) => {
      const skill = doc.skill;
      if (category && skill.category !== category) return null;
      if (source && skill.source.key !== source) return null;
      if (license && skill.source.license !== license) return null;
      if (distributable && !skill.distributable) return null;

      let score = 0;
      let exactHits = 0;
      const hits = [];
      const seen = new Set();

      for (const [term, weight] of weighted) {
        const tf = doc.tf.get(term);
        if (!tf) continue;
        score += bm25(tf, doc.length, term) * weight;
        // A document that contains the word the user actually typed should
        // beat one that only contains a synonym.
        if (weight === 1) exactHits += 1;
        // Record the reason for every matched term, including synonyms, so the
        // result can explain itself to an agent.
        if (!seen.has(term)) {
          seen.add(term);
          hits.push({ term, fields: matchedFields(skill, term), synonym: weight < 1 });
        }
      }

      if (score === 0) return null;
      score += exactHits * 1.8;

      // Phrase boost: the whole query appearing verbatim is a strong signal.
      if (phrase.length > 3) {
        if (skill.name.toLowerCase().includes(phrase)) score += 8;
        else if (doc.haystack.includes(phrase)) score += 3;
      }

      // Priorities.
      if (skill.status === "stable") score += 0.6;
      if (skill.distributable) score += 0.4;
      if (skill.status === "deprecated") score -= 3;

      return { skill, score, hits };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));

  // Drop results that only matched by accident: below a quarter of the best
  // score, the entry is noise, not an answer.
  const best = scored.length ? scored[0].score : 0;
  const floor = Math.max(2, best * 0.22);
  return scored.filter((entry) => entry.score >= floor).slice(0, limit);
}

function why(hits) {
  if (!hits.length) return "";
  return hits
    .map((hit) => {
      const where = hit.fields.length ? ` in ${hit.fields.join("/")}` : "";
      return hit.synonym ? `~${hit.term}${where}` : `${hit.term}${where}`;
    })
    .join(", ");
}

function toResult({ skill, score, hits }) {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    tags: skill.tags,
    status: skill.status,
    license: skill.source.license,
    source: skill.source.repo,
    distributable: Boolean(skill.distributable),
    tokens: skill.tokens || null,
    install: skill.install,
    page: `https://akshatnaruka.github.io/aidentity/skills/${skill.id}/`,
    content_url:
      skill.distributable && skill.path
        ? `https://akshatnaruka.github.io/aidentity/skills/${skill.id}/SKILL.md`
        : null,
    upstream: skill.upstream ? skill.upstream.url : skill.source.url,
    score: Number(score.toFixed(3)),
    why: why(hits),
  };
}

function search(query, limitOrOptions = 8) {
  const options = typeof limitOrOptions === "number" ? { limit: limitOrOptions } : limitOrOptions || {};
  return searchDetailed(query, options).map(toResult);
}

/**
 * A sensible front page for an empty query: the union of the curated bundles,
 * in bundle order, deduplicated. Every entry is installable.
 */
function defaults(limit = 24) {
  const seen = new Set();
  const out = [];
  for (const bundle of bundles) {
    for (const id of bundle.skills) {
      if (seen.has(id)) continue;
      seen.add(id);
      const skill = registry.skills.find((entry) => entry.id === id);
      if (!skill || !skill.distributable || skill.status !== "stable") continue;
      out.push(toResult({ skill, score: 0, hits: [] }));
      if (out.length >= limit) return out;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Did you mean
// ---------------------------------------------------------------------------

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let last = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = temp;
    }
  }
  return prev[b.length];
}

function suggest(query, limit = 5) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];
  const scored = [];
  for (const doc of INDEX.docs) {
    let best = 0;
    for (const term of doc.tf.keys()) {
      if (term.length < 3) continue;
      for (const q of queryTokens) {
        if (term.startsWith(q) || q.startsWith(term)) best = Math.max(best, 2);
        const distance = editDistance(q, term);
        if (distance <= 2) best = Math.max(best, 2 - distance + 1);
      }
    }
    if (best > 0) scored.push({ skill: doc.skill, score: best });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name))
    .slice(0, limit)
    .map(({ skill }) => ({ id: skill.id, name: skill.name, category: skill.category }));
}

// ---------------------------------------------------------------------------
// Recommend
// ---------------------------------------------------------------------------

// Hand-written intent aliases for the eight curated bundles. Synonyms cover
// the rest; these catch phrasing that the synonym graph misses.
const BUNDLE_ALIASES = {
  "web-app": ["saas", "dashboard", "website", "frontend", "landing", "nextjs", "react", "web", "fullstack"],
  "mobile-app": ["ios", "android", "react-native", "expo", "mobile", "app-store", "native", "phone"],
  "content-creator": ["blog", "seo", "copy", "social", "newsletter", "content", "marketing", "editorial"],
  "security-review": ["audit", "vulnerability", "appsec", "threat", "secure", "pentest", "compliance"],
  devops: ["ci", "deploy", "pipeline", "kubernetes", "docker", "infra", "observability", "release"],
  "data-ai": ["postgres", "database", "sql", "analytics", "ml", "eval", "rag", "vector", "llm"],
  "starter-10": ["start", "setup", "new-project", "baseline", "default", "bootstrap"],
  cloud: ["gcp", "google-cloud", "azure", "cloud-run", "gke", "cloud"],
};

function bundleScore(bundle, queryTokens) {
  const haystackTokens = new Set(
    tokenize(`${bundle.name} ${bundle.description} ${bundle.slug} ${(BUNDLE_ALIASES[bundle.slug] || []).join(" ")}`)
  );
  let score = 0;
  for (const term of queryTokens) {
    for (const [expanded, weight] of expand(term)) {
      if (haystackTokens.has(expanded)) score += 3 * weight;
    }
  }
  return score;
}

function recommend(task, limit = 5) {
  const queryTokens = [...new Set(tokenize(task))];

  const rankedBundles = bundles
    .map((bundle) => ({ bundle, score: bundleScore(bundle, queryTokens) }))
    .sort((a, b) => b.score - a.score);

  // Only claim a bundle when the task actually points at one. A weak match
  // (one incidental word) is worse than no bundle at all.
  const top = rankedBundles[0];
  const topBundle = top && top.score >= 6 ? top.bundle : null;

  const fromBundle = topBundle
    ? topBundle.skills
        .map((id) => registry.skills.find((skill) => skill.id === id))
        .filter(Boolean)
        .slice(0, limit)
        .map((skill) => ({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          category: skill.category,
          tokens: skill.tokens || null,
          install: skill.install,
          page: `https://akshatnaruka.github.io/aidentity/skills/${skill.id}/`,
        }))
    : [];

  const matches = search(task, limit);

  return {
    task,
    bundle: topBundle
      ? {
          slug: topBundle.slug,
          name: topBundle.name,
          description: topBundle.description,
          tokens: topBundle.skills
            .map((id) => registry.skills.find((skill) => skill.id === id))
            .filter((skill) => skill && skill.tokens)
            .reduce((sum, skill) => sum + skill.tokens, 0) || null,
        }
      : null,
    from_bundle: fromBundle,
    skills: matches,
    suggestions: matches.length ? [] : suggest(task),
    install_bundle: topBundle
      ? `npx aidentity add ${topBundle.skills.slice(0, limit).join(" ")}`
      : null,
  };
}

module.exports = {
  registry,
  bundles,
  search,
  searchDetailed,
  defaults,
  recommend,
  suggest,
  tokenize,
  tokens,
  stem,
  INDEX,
};
