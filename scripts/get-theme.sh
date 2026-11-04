#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-${DESIGN_SYSTEM_VERSION:-latest}}"
BASE="https://github.com/gurukulams/design-system/releases"
DEST="themes/design-system"

# Already downloaded? Keep it. Delete the folder to fetch again.
if [ -f "$DEST/VERSION" ]; then
  echo "design-system $(cat "$DEST/VERSION") already installed (delete $DEST to re-download)"
  exit 0
fi

if [ "$VERSION" = "latest" ]; then
  URL="$BASE/latest/download/design-system.tar.gz"
else
  URL="$BASE/download/$VERSION/design-system.tar.gz"
fi

# Download and extract to a temp folder first, so a failed download
# never leaves a half-installed theme behind.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -fsSL "$URL" | tar -xz -C "$TMP"

mkdir -p "$(dirname "$DEST")"
rm -rf "$DEST"
mv "$TMP" "$DEST"
trap - EXIT

echo "Installed design-system $(cat "$DEST/VERSION")"