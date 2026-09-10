#!/usr/bin/env bash
#
# Build the visual fixture statically (`myst build --html`) with the theme
# under test and serve the result from a plain file server, for the
# `static-chrome` Playwright project (tests/visual/static.spec.ts).
#
# The `myst start` servers Playwright also launches (serve.sh) run the theme
# in MODE=app, where every loader is live. This one is the deployed shape --
# MODE=static, loaders unreachable -- which is where a whole class of defects
# (#138, #150, #186) only ever shows up.
#
#   THEME_TEMPLATE   theme under test (local build dir or zip URL), as serve.sh
#   FIXTURE_DIR      fixture project to build (default `fixture`)
#   STATIC_PORT      port to serve on (default 3114, matching playwright.config.ts)
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
src="$here/${FIXTURE_DIR:-fixture}"
# Gitignored working copy: the source fixture is being served by `myst start`
# at the same time, and two builds must not share one `_build`.
work="$here/.static"

: "${THEME_TEMPLATE:?set THEME_TEMPLATE to a local theme build dir or a zip URL}"

rm -rf "$work"
mkdir -p "$work"
for entry in "$src"/* "$src"/.[!.]*; do
  [ -e "$entry" ] || continue
  case "$(basename "$entry")" in
    _build|myst.yml) continue ;;
  esac
  cp -R "$entry" "$work/"
done

# Same substitution as serve.sh (escape sed replacement specials).
esc=$(printf '%s' "$THEME_TEMPLATE" | sed 's/[\\&|]/\\&/g')
sed "s|__THEME__|${esc}|" "$work/myst.yml.in" > "$work/myst.yml"

echo "[static] fixture:  ${FIXTURE_DIR:-fixture} (copied to tests/visual/.static)"
echo "[static] template: $THEME_TEMPLATE"
echo "[static] port:     ${STATIC_PORT:-3114}"
cd "$work"
myst build --html
exec node "$here/static-server.mjs" "$work/_build/html" "${STATIC_PORT:-3114}"
