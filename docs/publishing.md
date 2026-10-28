# Publishing the CLI

The npm package is **staged, not live**. The token is valid, but npm now restricts
bypass-2FA tokens for direct publishing: `npm publish` creates a `0.0.0-stage`
placeholder and expects proof-of-presence (2FA) before releasing the real version.

There are three ways out. Trusted publishing is the one that needs no OTP at all.

## Option A — Trusted publishing (recommended, no OTP)

1. Open the package settings: **https://www.npmjs.com/package/aidentity/settings**
   (log in on the desktop browser; the QR is only the CLI login).
2. **Trusted Publishing → Add a publisher → GitHub**:
   - Organization/user: `AkshatNaruka`
   - Repository: `aidentity`
   - Workflow filename: `publish.yml`
   - Environment: leave empty
3. Run **Actions → Publish CLI → Run workflow**.

The workflow uses GitHub OIDC (`id-token: write`), not `NPM_TOKEN`. npm verifies
the repository and workflow, then publishes with provenance. No QR, no OTP, no
long-lived token.

If the package page has no Trusted Publishing section yet because only the
placeholder exists, approve the staged version first (Option B), then add it.

## Option B — Approve the staged version with 2FA

The staged version is `0.1.0`; the placeholder is `0.0.0-stage`.

1. Open **https://www.npmjs.com/package/aidentity** and look for **Staged publishes**
   (or Settings → Publishing access). Approve `0.1.0`.
2. Or add an authenticator app in **Account → Two-Factor Authentication**, then:

   ```bash
   npm stage list
   npm stage approve <stage-id>
   ```

   The bypass token cannot approve; approval needs a human OTP/passkey/recovery code.

3. If the web login also refuses your passkey, use a **recovery code** on the
   login screen, or reset 2FA from a signed-in session.

## Option C — Disable the publish 2FA requirement

In **Account → Two-Factor Authentication**, turn off “Require 2FA for publishing”,
then publish with the token. This is the least secure option; turn it back on
afterwards.

```bash
npm publish --access public
```

## Verify

```bash
npm view aidentity version          # expect 0.1.0
npx -y aidentity --help
npx -y aidentity add code-review --agent claude --dry-run
```

## If you keep the GitHub install path

`npx AkshatNaruka/aidentity add …` works today and is versioned by commit. It is
a valid permanent fallback, just longer.

## Switch the docs back after publishing

```bash
grep -rl "npx AkshatNaruka/aidentity" README.md CONTRIBUTING.md docs opencode site scripts \
  | xargs sed -i '' 's#npx AkshatNaruka/aidentity#npx aidentity#g'
node scripts/build-registry.js
node scripts/build-catalog.js
node site/build.js
./scripts/check-all.sh
git add -A && git commit -m "docs: use the published npm package" && git push
```
