#!/usr/bin/env bash
set -euo pipefail

SDK_PATH="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
if [[ -z "$SDK_PATH" && -x "$HOME/.local/bin/android" ]]; then
  SDK_PATH="$($HOME/.local/bin/android info | awk '$1 == "sdk:" {print $2; exit}')"
fi
ADB="${ADB:-$SDK_PATH/platform-tools/adb}"
ADB_TARGET=()
if [[ -n "${ADB_SERIAL:-}" ]]; then ADB_TARGET=(-s "$ADB_SERIAL"); fi
APK="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/android/app/build/outputs/apk/debug/app-debug.apk"
[[ -f "$APK" ]] || { echo "APK missing: run scripts/android-build.sh" >&2; exit 1; }
if [[ ! -x "$ADB" ]]; then
  echo "WAITING_FOR_DEVICE: adb not found at $ADB"
  exit 0
fi

DEVICE_COUNT="$($ADB devices | awk 'NR > 1 && $2 == "device" {count++} END {print count + 0}')"
if [[ "$DEVICE_COUNT" == "0" ]]; then
  echo "WAITING_FOR_DEVICE: no authorized Android device or emulator"
  exit 0
fi
if [[ -z "${ADB_SERIAL:-}" && "$DEVICE_COUNT" != "1" ]]; then
  echo "NEXT_HUMAN_ACTION: set ADB_SERIAL when multiple Android targets are connected"
  exit 1
fi
echo "CONNECTED_DEVICES: $DEVICE_COUNT"
"$ADB" "${ADB_TARGET[@]}" shell pm list packages | grep -q '^package:com.morph.runtime$' && echo "MORPH_INSTALLED: yes" || echo "MORPH_INSTALLED: no"
ACCESSIBILITY_SERVICE="com.morph.runtime/com.morph.runtime.PolicyAccessibilityService"
if "$ADB" "${ADB_TARGET[@]}" shell settings get secure enabled_accessibility_services | tr ':' '\n' | grep -qx "$ACCESSIBILITY_SERVICE"; then
  echo "ACCESSIBILITY: enabled"
else
  echo "NEXT_HUMAN_ACTION: enable Morph in Android Accessibility settings"
fi
