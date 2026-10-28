# Publishing the CLI

Until the npm package exists, the working install command is:

```bash
npx AkshatNaruka/aidentity add code-review
```

That runs the same CLI straight from this repository. Publish once to enable
`npx aidentity add …`.

## One-time publish

The npm account is `probiex` (`narukaakshat@gmail.com`). Publishing requires a
one-time password.

```bash
cd aidentity
npm login                 # if the token has expired
npm publish --access public
# complete the browser/OTP prompt
```

Then verify:

```bash
npm view aidentity version
npx -y aidentity --help
npx -y aidentity add code-review --agent claude --dry-run
```

## Switch the docs back

After the package is live, replace the long form and rebuild:

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

`package.json` includes `cli/`, `registry/`, `skills/`, `bundles/`, `README.md`
and `LICENSE`: about 5 MB packed, 18 MB unpacked. No install scripts, no
postinstall, no network calls at install time.

## If publish is blocked

Keep the GitHub form. It is fully functional and versioned by commit. The only
difference is the longer command.
