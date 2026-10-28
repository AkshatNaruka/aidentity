# Publishing the CLI

`npx aidentity` needs a published npm package. The npm account uses 2FA, and the
CLI's browser login defaults to passkeys. If your phone has no passkey, use a
**granular access token with "Bypass 2FA"** instead. That is the supported path
for CI and for publishing without a QR code.

## Option A — publish from GitHub Actions (recommended)

1. Open <https://www.npmjs.com/settings/probiex/tokens>.
2. **Generate New Token → Granular Access Token**.
   - Name: `aidentity-publish`
   - Expiration: 90 days
   - Permissions: **Read and write**
   - Packages: **All packages** (or `aidentity`)
   - Check **Bypass 2FA**
3. Copy the token.
4. Add it to the repository:

   ```bash
   gh secret set NPM_TOKEN
   # paste the token when prompted
   ```

5. Run **Actions → Publish CLI → Run workflow**. Leave `dry_run` off.

The workflow verifies the registry, license gate and validator before publishing.

## Option B — publish locally with the token

```bash
npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN
npm publish --access public
```

The token bypasses the OTP prompt. Do not commit it; `npm config` writes to
`~/.npmrc`.

## Why the QR appears

`npm publish` with an interactive login asks for a one-time password. npm's web
login now prefers passkeys; if the phone has no passkey registered, the QR has
nothing to complete. A granular token with **Bypass 2FA** is the way around it.
Adding an authenticator app (TOTP) in npm account settings also works, then:

```bash
npm publish --access public --otp=123456
```

## Verify

```bash
npm view aidentity version
npx -y aidentity --help
npx -y aidentity add code-review --agent claude --dry-run
```

## Switch the docs back

After the package is live:

```bash
grep -rl "npx AkshatNaruka/aidentity" README.md CONTRIBUTING.md docs opencode site scripts \
  | xargs sed -i '' 's#npx AkshatNaruka/aidentity#npx aidentity#g'
node scripts/build-registry.js
node scripts/build-catalog.js
node site/build.js
./scripts/check-all.sh
git add -A && git commit -m "docs: use the published npm package" && git push
```

## What ships

`cli/`, `registry/`, `skills/`, `bundles/`, `README.md`, `LICENSE` — about 5 MB
packed, 18 MB unpacked. No postinstall, no network calls at install time.
