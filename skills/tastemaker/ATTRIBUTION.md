# Attribution

- **Source:** [codeswithroh/tastemaker](https://github.com/codeswithroh/tastemaker)
- **Commit:** `792a28a820ec4e9159ef8621c21a6c88528bbf2e`
- **Imported:** 2026-10-28
- **License:** MIT (see `LICENSE`)
- **Imported skills:** tastemaker, ideagram

## Script review

Scripts are copied unmodified and were **not executed**.

- `tastemaker/scripts/fetch_photos.py` fetches CC0/public-domain photography from
  Openverse over HTTPS. **Network call at runtime** — keyless, rate-limited, and
  attribution-free by filter.
- `tastemaker/scripts/_netguard.py` is an HTTPS + host allowlist used by the
  fetching scripts.
- `ideagram/scripts/*.py` are local SVG/PNG builders and validators.

No credential access found. If you run the fetchers, review them first.
