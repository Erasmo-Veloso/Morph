#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK_PATH="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
if [[ -z "$SDK_PATH" && -x "$HOME/.local/bin/android" ]]; then
  SDK_PATH="$($HOME/.local/bin/android info | awk '$1 == "sdk:" {print $2; exit}')"
fi
if [[ -z "$SDK_PATH" || ! -d "$SDK_PATH" ]]; then
  echo "Android SDK not found. Set ANDROID_SDK_ROOT or ANDROID_HOME." >&2
  exit 1
fi

export ANDROID_HOME="$SDK_PATH"
export ANDROID_SDK_ROOT="$SDK_PATH"
cd "$REPO_ROOT"
GRADLE_ARGS=()
if [[ -n "${MORPH_SERVER_URL:-}" ]]; then
  GRADLE_ARGS+=("-Pmorph.serverUrl=$MORPH_SERVER_URL")
fi
./android/gradlew -p android assembleDebug --no-daemon "${GRADLE_ARGS[@]}"
echo "APK: $REPO_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
