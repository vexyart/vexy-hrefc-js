#!/usr/bin/env bash
# this_file: build.sh
# Build the library (dist/) and/or the documentation site (docs/).
# Usage: ./build.sh [all|lib|docs]   (default: all)
#   lib   install dependencies and build dist/ (also refreshes src_docs/md/assets/)
#   docs  build the documentation site from src_docs/ into docs/
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
target="${1:-all}"
case "$target" in
  all|lib|docs) ;;
  *) echo "usage: $0 [all|lib|docs]" >&2; exit 2 ;;
esac

if [[ "$target" == all || "$target" == lib ]]; then
  echo "→ installing dependencies"
  npm install
  echo "→ building dist/"
  npm run build
fi

if [[ "$target" == all || "$target" == docs ]]; then
  echo "→ building docs/"
  src_docs/build.sh
fi

echo "✓ build complete"
