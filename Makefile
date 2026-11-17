.PHONY: check build-theme build-zip

# Releases ship via the tag-triggered GitHub Release workflow
# (.github/workflows/release.yml) — see CONTRIBUTING.md "Releases".
#
# The lecture theme lives in the themes/lecture workspace; its bundle is still
# assembled at the repository root, in .deploy/$(THEME), so the test harness,
# the preview workflow and THEME_TEMPLATE paths are unchanged.

THEME = quantecon-theme
LECTURE = themes/lecture
VERSION = $(shell jq -r '.version' $(LECTURE)/package.json)

check:
	@which jq > /dev/null || (echo "Error: the jq command is not available. Please install it first (brew install jq | apt-get install jq)." && exit 1)

# Assembles the release workflow's bundle into .deploy/$(THEME), then
# npm-installs it so the visual/FOUC test harness can serve it directly
# (THEME_TEMPLATE=$$PWD/.deploy/$(THEME)). The node_modules this creates is
# local-only — `build-zip` excludes it, matching the release asset.
build-theme: check
	rm -rf .deploy/$(THEME)
	mkdir -p .deploy/$(THEME)
	find $(LECTURE)/template -type f -exec cp {} .deploy/$(THEME) \;
	npm run prod:build -w $(LECTURE)
	cp -r $(LECTURE)/public .deploy/$(THEME)/public
	cp -r $(LECTURE)/build .deploy/$(THEME)/build
	cp $(LECTURE)/CHANGELOG.md .deploy/$(THEME)/CHANGELOG.md
	sed -i.bak "s/VERSION/$(VERSION)/g" .deploy/$(THEME)/package.json && rm .deploy/$(THEME)/package.json.bak
	sed -E "s/^version: .*/version: $(VERSION)/" $(LECTURE)/template.yml > .deploy/$(THEME)/template.yml
	cd .deploy/$(THEME) && npm install

# Zips the bundle for testing the release artifact locally — node_modules
# excluded, so the zip's contents match what the release workflow attaches
# to the GitHub Release (which ships only a lockfile).
build-zip: build-theme
	cd .deploy && rm -f $(THEME).zip && zip -rq $(THEME).zip $(THEME) -x "$(THEME)/node_modules/*"
	@echo "Wrote .deploy/$(THEME).zip"
