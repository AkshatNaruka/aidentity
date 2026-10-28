# Publishing the CLI

**Status: published.** `aidentity@0.1.0` is live on npm:

```bash
npx aidentity --help
npx aidentity add code-review --agent claude --dry-run
```

## Before a release

```bash
./scripts/check-all.sh
npm version patch        # or minor/major
```

`prepublishOnly` runs the registry check, license gate and validator.

## Publishing

Preferred: **Actions → Publish CLI → Run workflow**. The workflow uses npm
**trusted publishing** (GitHub OIDC) with provenance, so it needs no token and no
OTP. Configure it once at:

<https://www.npmjs.com/package/aidentity/settings> → Trusted Publishing → GitHub
→ owner `AkshatNaruka`, repo `aidentity`, workflow `publish.yml`.

Fallback with a token:

```bash
npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN
npm publish --access public
```

Note: npm now stages publishes made with bypass-2FA tokens. If a release appears
as `0.0.0-stage`, approve it in the npm web UI, or use trusted publishing.

## Verify

```bash
npm view aidentity version
npx -y aidentity --help
npx -y aidentity add code-review --agent claude --dry-run
```

## What ships

`cli/`, `registry/`, `skills/`, `bundles/`, `README.md`, `LICENSE` — about 9 MB
packed, 29 MB unpacked. No postinstall and no network calls at install time.
