# Manual submission

Automation is optional. The repository does not depend on GitHub Actions
minutes: contributors can submit by issue or pull request, and a maintainer
runs the same checks locally.

## For contributors

### Fastest: open an issue

Use the [submit-a-skill](https://github.com/AkshatNaruka/aidentity/issues/new?template=submit-a-skill.yml)
form. Include the upstream URL, license, a two-sentence description and the
category. A maintainer will do the import.

### Preferred: open a pull request

1. Fork and clone.
2. Add one record to `registry/skills.json` following the shape in
   [CONTRIBUTING.md](../CONTRIBUTING.md).
3. Run the gates:

   ```bash
   ./scripts/check-all.sh
   ```

4. Open a PR. One skill per PR.

If the skill is new *content* (not just an entry), place it under
`skills/<source>/<name>/` with the upstream `LICENSE`, and add the source to
`registry/sources.json`. Never add content whose license does not allow
redistribution — use a pointer entry instead.

## For maintainers

### Review checklist

- [ ] Upstream repository exists, is not archived, and has commits in the last
      six months.
- [ ] License is in the allowlist (MIT, Apache-2.0, BSD, ISC, MPL-2.0, CC0,
      CC-BY, CC-BY-SA, Unlicense).
- [ ] `SKILL.md` has `name` and `description` frontmatter.
- [ ] No duplicate `name` in the registry.
- [ ] No prompt-injection shapes, no silent network calls in scripts.
- [ ] Content is placed with the upstream `LICENSE` and an `ATTRIBUTION.md`.
- [ ] `./scripts/check-all.sh` passes.

### Import an issue by hand

```bash
# 1. verify upstream
gh api repos/<owner>/<repo> --jq '{stars:.stargazers_count,license:.license.spdx_id,pushed:.pushed_at,archived}'

# 2. copy the skill
mkdir -p skills/<source>/<name>
cp -R /path/to/upstream/<name>/* skills/<source>/<name>/
cp /path/to/upstream/LICENSE skills/<source>/LICENSE

# 3. record provenance, rebuild, gate
#    (source entry + registry/manifests/<source>.json, see registry/manifests/)
node scripts/build-registry.js
node scripts/build-catalog.js
node scripts/check-licenses.js
node scripts/validate.js

# 4. commit and push
git add skills/<source> registry
git commit -m "feat(skills): add <source>"
git push
```

### If Actions is unavailable

Run `./scripts/check-all.sh` locally before merging. The site can be built and
published without Actions:

```bash
node site/build.js
git subtree push --prefix site/dist origin gh-pages   # or your usual gh-pages flow
```

The repository is designed so the registry, site and CLI work from a clone.
