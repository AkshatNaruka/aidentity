#!/usr/bin/env bash
# Everything CI runs, locally. No GitHub Actions minutes required.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ registry"
node scripts/build-registry.js --check
echo "→ catalog"
node scripts/build-catalog.js --check
echo "→ licenses"
node scripts/check-licenses.js
echo "→ tools doc"
node scripts/build-tools-doc.js --check
echo "→ validate"
node scripts/validate.js
echo "✓ all checks passed"
