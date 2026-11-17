#!/usr/bin/env bash
#
# Build the fixture book statically with the theme under test and serve it,
# for Playwright (playwright.config.ts).
#
#   THEME_TEMPLATE   a local theme build directory (`make build-book` then
#                    $PWD/.deploy/quantecon-theme-book) or a release zip URL
#   PORT             port to serve on (default 3121)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
: "${THEME_TEMPLATE:?set THEME_TEMPLATE to a local book theme build dir or a zip URL}"
work="$here/.fixture-build"
rm -rf "$work" && mkdir -p "$work"
cp -R "$here/fixture/." "$work/"
esc=$(printf '%s' "$THEME_TEMPLATE" | sed 's/[\\&|]/\\&/g')
sed "s|__THEME__|${esc}|" "$work/myst.yml.in" > "$work/myst.yml"
cd "$work"
myst build --html
# The lecture theme's file server: no dependencies, serves a static build.
exec node "$here/../../lecture/tests/visual/static-server.mjs" "$work/_build/html" "${PORT:-3121}"
