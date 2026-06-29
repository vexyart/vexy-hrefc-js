#!/usr/bin/env bash
# this_file: publish.sh
# Release flow: test, build, let gitnextver own the version, publish it.
#
# gitnextver (https://pypi.org/project/gitnextver/) pulls, commits ALL pending
# changes, tags the next vX.Y.Z (patch bump, or v1.0.0 when there are no tags),
# pushes commit + tag, and prints the new version to stdout. We take that number,
# record it in package.json, and publish it.
#
# There is deliberately NO "working tree must be clean" guard: gitnextver commits
# whatever is pending, so a dirty tree is the normal starting state here.
set -euo pipefail
cd "$(dirname "$0")"

# Make sure we can actually publish BEFORE doing anything that bumps the version.
# npm/pnpm never prompt for login on a failed publish (a bad token just 404s),
# so check here and present the login ourselves when needed.
if ! npm whoami >/dev/null 2>&1; then
  if [ -t 0 ]; then
    echo "→ not logged in to npm — launching 'npm login'"
    npm login
    npm whoami >/dev/null 2>&1 || { echo "✗ still not logged in to npm"; exit 1; }
  else
    echo "✗ not logged in to npm. Run 'npm login' and retry."; exit 1
  fi
fi
echo "✓ npm user: $(npm whoami)"

echo "→ installing dependencies"
npm install

echo "→ testing"
npm test

echo "→ building"
npm run build

# gitnextver does the commit + tag + push and returns the version on stdout.
# (Its loguru/rich output goes to stderr; stdout is just "vX.Y.Z".)
echo "→ versioning with gitnextver"
VER_TAG="$(uvx gitnextver@latest | tail -n1 | tr -d '[:space:]')"

if [ -n "$VER_TAG" ]; then
  # gitnextver bumped + tagged a new version — record it in package.json and
  # commit that one change so the published package matches the tag.
  VER="${VER_TAG#v}"
  echo "  new version: $VER  (tag $VER_TAG)"
  node -e '
    const fs = require("fs"), f = "package.json";
    const p = JSON.parse(fs.readFileSync(f, "utf8"));
    if (p.version === process.argv[1]) process.exit(0);
    p.version = process.argv[1];
    fs.writeFileSync(f, JSON.stringify(p, null, 2) + "\n");
  ' "$VER"
  if ! git diff --quiet -- package.json; then
    git commit -qm "Set package.json version to $VER" -- package.json
    git push --quiet origin HEAD
  fi
else
  # Clean tree: gitnextver had nothing to bump. Publish whatever package.json
  # already says, so a re-run after a failed publish (e.g. expired npm token)
  # isn't blocked. npm rejects a genuine duplicate version on its own.
  VER="$(node -p 'require("./package.json").version')"
  echo "  nothing to version — (re)publishing current version $VER"
fi

echo "→ publishing vexy-hrefc@$VER to npm"
npm publish --access public

echo "✓ published vexy-hrefc@$VER  (tag $VER_TAG)"
