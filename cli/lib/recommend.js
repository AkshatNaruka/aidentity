/**
 * Shared retrieval for the CLI and the MCP server.
 * Zero dependencies, reads the generated registry and bundles.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "registry", "skills.json"), "utf8"));
const bundleFile = path.join(ROOT, "bundles", "bundles.json");
const bundles = fs.existsSync(bundleFile)
  ? JSON.parse(fs.readFileSync(bundleFile, "utf8")).bundles
  : [];

const STOP = new Set([
  "a", "an", "and", "are", "as", "at", "be", "build", "by", "for", "from", "i", "in", "is", "it",
  "my", "of", "on", "or", "that", "the", "to", "want", "with", "need", "help", "using", "use",
]);

function tokens(text) {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 1 && !STOP.has(token));
}

function scoreSkill(skill, queryTokens) {
  const name = skill.name.toLowerCase();
  const tags = skill.tags.join(" ").toLowerCase();
  const category = skill.category.toLowerCase();
  const description = skill.description.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (name.includes(token)) score += 5;
    if (tags.includes(token)) score += 3;
    if (category.includes(token)) score += 3;
    if (description.includes(token)) score += 1;
  }
  if (skill.status !== "stable") score -= 2;
  if (!skill.distributable) score -= 1;
  return score;
}

function search(query, limit = 8) {
  const queryTokens = tokens(query);
  if (!queryTokens.length) return [];
  const scored = registry.skills
    .map((skill) => ({ skill, score: scoreSkill(skill, queryTokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));
  // Drop weak description-only matches so a "postgres" query does not return
  // every skill that mentions databases in passing.
  const floor = Math.max(3, Math.ceil((scored[0]?.score || 0) * 0.5));
  return scored
    .filter((entry) => entry.score >= floor)
    .slice(0, limit)
    .map(({ skill, score }) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      tags: skill.tags,
      status: skill.status,
      license: skill.source.license,
      source: skill.source.repo,
      install: skill.install,
      page: `https://akshatnaruka.github.io/aidentity/skills/${skill.id}/`,
      content_url:
        skill.distributable && skill.path
          ? `https://akshatnaruka.github.io/aidentity/skills/${skill.id}/SKILL.md`
          : null,
      upstream: skill.upstream ? skill.upstream.url : skill.source.url,
      score,
    }));
}

const BUNDLE_ALIASES = {
  "web-app": ["saas", "dashboard", "website", "frontend", "landing", "nextjs", "react", "web"],
  "mobile-app": ["ios", "android", "react-native", "expo", "mobile", "app-store"],
  "content-creator": ["blog", "seo", "copy", "social", "newsletter", "content", "marketing"],
  "security-review": ["audit", "vulnerability", "appsec", "threat", "secure"],
  devops: ["ci", "deploy", "pipeline", "kubernetes", "docker", "infra", "observability"],
  "data-ai": ["postgres", "database", "sql", "analytics", "ml", "eval", "rag", "vector"],
  "starter-10": ["start", "setup", "new-project", "baseline", "default"],
  cloud: ["gcp", "google-cloud", "azure", "cloud-run", "gke"],
};

function recommend(task, limit = 5) {
  const queryTokens = tokens(task);
  const bundleRanked = bundles
    .map((bundle) => {
      const haystack = `${bundle.name} ${bundle.description} ${bundle.slug}`.toLowerCase();
      const aliases = BUNDLE_ALIASES[bundle.slug] || [];
      let score = queryTokens.reduce((sum, token) => sum + (haystack.includes(token) ? 4 : 0), 0);
      for (const token of queryTokens) {
        if (aliases.some((alias) => alias.includes(token) || token.includes(alias))) score += 5;
      }
      return { bundle, score };
    })
    .sort((a, b) => b.score - a.score);

  const topBundle = bundleRanked[0] && bundleRanked[0].score > 0 ? bundleRanked[0].bundle : null;
  const fromBundle = topBundle
    ? topBundle.skills
        .map((id) => registry.skills.find((skill) => skill.id === id))
        .filter(Boolean)
        .map((skill) => ({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          install: skill.install,
          page: `https://akshatnaruka.github.io/aidentity/skills/${skill.id}/`,
        }))
        .slice(0, limit)
    : [];

  const matches = search(task, limit);
  return {
    task,
    bundle: topBundle ? { slug: topBundle.slug, name: topBundle.name, description: topBundle.description } : null,
    from_bundle: fromBundle,
    skills: matches,
    install_bundle: topBundle ? `node scripts/install.js ${topBundle.slug} --platform <claude|cursor|codex|gemini|opencode|copilot>` : null,
  };
}

module.exports = { registry, bundles, search, recommend, tokens };
