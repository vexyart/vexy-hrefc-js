#!/usr/bin/env bash
# this_file: build.sh
# Install dependencies and build dist/. Run from anywhere.
set -euo pipefail
cd "$(dirname "$0")"

echo "→ installing dependencies"
npm install

echo "→ building dist/"
npm run build

echo "✓ build complete"
