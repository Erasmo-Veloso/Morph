#!/usr/bin/env bash
set -euo pipefail

SDK_PATH="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
if [[ -z "$SDK_PATH" && -x "$HOME/.local/bin/android" ]]; then
  SDK_PATH="$($HOME/.local/bin/android info | awk '$1 == "sdk:" {print $2; exit}')"
fi
ADB="${ADB:-$SDK_PATH/platform-tools/adb}"
[[ -x "$ADB" ]] || { echo "adb not found: $ADB" >&2; exit 1; }
"$ADB" logcat -v brief -s MorphSession:M AndroidRuntime:E
