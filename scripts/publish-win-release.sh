#!/usr/bin/env bash
set -euo pipefail

version="$(node -p "require('./package.json').version")"
tag="v${version}"

shopt -s nullglob
assets=(release/TactiDesk-Setup-*.exe release/latest.yml release/TactiDesk-Setup-*.exe.blockmap)
if [ "${#assets[@]}" -eq 0 ]; then
  echo "No Windows release assets in release/" >&2
  exit 1
fi
if ! ls release/TactiDesk-Setup-*.exe >/dev/null 2>&1; then
  echo "Missing TactiDesk-Setup-*.exe" >&2
  exit 1
fi
if [ ! -f release/latest.yml ]; then
  echo "Missing release/latest.yml (needed for auto-update)" >&2
  exit 1
fi

if gh release view "$tag" >/dev/null 2>&1; then
  gh release upload "$tag" "${assets[@]}" --clobber
  echo "Updated existing release $tag"
  exit 0
fi

gh release create "$tag" "${assets[@]}" \
  --title "TactiDesk ${version}" \
  --generate-notes \
  --latest
echo "Created release $tag"
