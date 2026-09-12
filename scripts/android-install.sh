#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK_PATH="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
if [[ -z "$SDK_PATH" && -x "$HOME/.local/bin/android" ]]; then
  SDK_PATH="$($HOME/.local/bin/android info | awk '$1 == "sdk:" {print $2; exit}')"
fi
ADB="${ADB:-$SDK_PATH/platform-tools/adb}"
ADB_TARGET=()
if [[ -n "${ADB_SERIAL:-}" ]]; then ADB_TARGET=(-s "$ADB_SERIAL"); fi
APK="$REPO_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
[[ -x "$ADB" ]] || { echo "adb not found: $ADB" >&2; exit 1; }
[[ -f "$APK" ]] || { echo "APK not found. Run scripts/android-build.sh first." >&2; exit 1; }
"$ADB" "${ADB_TARGET[@]}" install -r "$APK"
"$ADB" "${ADB_TARGET[@]}" shell am force-stop com.morph.runtime
"$ADB" "${ADB_TARGET[@]}" shell monkey -p com.morph.runtime 1 >/dev/null
