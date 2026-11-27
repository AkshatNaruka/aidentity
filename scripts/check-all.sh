#!/usr/bin/env bash
# Everything CI runs, locally. No GitHub Actions minutes required.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ registry"
node scripts/build-registry.js --check
echo "→ security"
node scripts/scan-skills-security.js --check
echo "→ setup prompts"
node scripts/build-setup-prompts.js --check
echo "→ catalog"
node scripts/build-catalog.js --check
echo "→ licenses"
node scripts/check-licenses.js
echo "→ tools doc"
node scripts/build-tools-doc.js --check
echo "→ validate"
node scripts/validate.js
echo "→ test"
node scripts/test.js
echo "✓ all checks passed"
