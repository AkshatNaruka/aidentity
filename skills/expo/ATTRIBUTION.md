# Attribution

- **Source:** [expo/skills](https://github.com/expo/skills)
- **Commit:** `8a0dc4fa57ae345923c357e1451cbcd8b6f2a7db`
- **Imported:** 2026-10-28
- **License:** MIT (see `LICENSE`)
- **Imported skills:** 23 official Expo/React Native skills under `plugins/expo/skills/`
- **Excluded:** `expo-skill-eval` (maintainer meta-skill) and the experimental plugin,
  which targets migrating an existing native app rather than building one.

## Script review

Copied unmodified, **not executed**.

- `eas-workflows/scripts/fetch.js` fetches workflow schema/docs. **Network call.**
- `expo-ui/scripts/list-components.js` enumerates local components. No network.

No credential access found.
