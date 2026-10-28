# AGENTS — Expo

## Stack

- Expo SDK, Expo Router (file-based), TypeScript strict.
- Native UI: `@expo/ui` for sheets, pickers, switches; React Native primitives for the rest.
- Reanimated + Gesture Handler for motion. `expo-haptics` for feedback.
- EAS for builds, updates and store submission.

## Rules

1. **Routes are files.** `app/` is the router. A screen is `app/<segment>/index.tsx`; a modal is a route with `presentation: "modal"`.
2. **Use native controls.** Do not rebuild a picker, switch, or action sheet from Views. Reach for `@expo/ui` first.
3. **Respect the platform.** iOS and Android differ in navigation, back behaviour, and typography. Test both. Never ship a web-only API to native.
4. **Lists are virtualised.** `FlatList`/`FlashList`, never `ScrollView` with `.map()` over unbounded data.
5. **Animations run on the UI thread.** Reanimated worklets, not `setState` loops.
6. **Secrets do not ship.** Only `EXPO_PUBLIC_*` reaches the client. Anything else belongs on a server.
7. **Test on a device.** Simulator is necessary, not sufficient.

## Commands

```bash
npx expo start
npx expo run:ios
npx expo run:android
npx tsc --noEmit
npx expo-doctor
eas build --profile preview --platform ios
eas update --branch preview
```

## Definition of done

- TypeScript passes.
- New screen → loading, empty, error states; safe-area handled.
- New list → virtualised and keyed.
- No hardcoded colours; use the theme.
- `npx expo-doctor` clean.
