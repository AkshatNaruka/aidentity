#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
APP="$DIST/Aidentity.app"
ELECTRON="$ROOT/node_modules/electron/dist/Electron.app"

rm -rf "$APP"
mkdir -p "$DIST"
cp -R "$ELECTRON" "$APP"

# Bring in the application code + data the app needs at runtime.
APPRES="$APP/Contents/Resources/app"
rm -rf "$APPRES"
mkdir -p "$APPRES"
for dir in app cli registry skills bundles roles rules agents commands hooks prompts; do
  if [ -d "$ROOT/$dir" ]; then cp -R "$ROOT/$dir" "$APPRES/$dir"; fi
done
# package.json so Electron knows the entry point.
cat > "$APPRES/package.json" <<'EOF'
{
  "name": "aidentity",
  "version": "1.0.0",
  "main": "app/main.js",
  "productName": "Aidentity"
}
EOF

# Replace the icon.
cp "$ROOT/app/icon.icns" "$APP/Contents/Resources/electron.icns" 2>/dev/null || true
# macOS uses CFBundleIconFile; add our icon file name.
cp "$ROOT/app/icon.icns" "$APP/Contents/Resources/Aidentity.icns"

# Rename the executable.
mv "$APP/Contents/MacOS/Electron" "$APP/Contents/MacOS/Aidentity"

# Patch Info.plist.
PLIST="$APP/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleName Aidentity" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :CFBundleName string Aidentity" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName Aidentity" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string Aidentity" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier dev.aidentity.app" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :CFBundleIdentifier string dev.aidentity.app" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable Aidentity" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleIconFile Aidentity" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :CFBundleIconFile string Aidentity" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :LSMinimumSystemVersion 11.0" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :LSMinimumSystemVersion string 11.0" "$PLIST"

# Ad-hoc sign so Gatekeeper allows local launch.
codesign --force --deep --sign - "$APP" 2>&1 | tail -3 || true

echo "Built: $APP"
echo "Launch: open \"$APP\""
