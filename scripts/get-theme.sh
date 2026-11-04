#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-${DESIGN_SYSTEM_VERSION:-latest}}"
BASE="https://github.com/gurukulams/design-system/releases"
DEST="themes/design-system"

if [ "$VERSION" = "latest" ]; then
  URL="$BASE/latest/download/design-system.tar.gz"
else
  URL="$BASE/download/$VERSION/design-system.tar.gz"
fi

rm -rf "$DEST" && mkdir -p "$DEST"
curl -fsSL "$URL" | tar -xz -C "$DEST"
echo "Installed design-system $(cat "$DEST/VERSION")"