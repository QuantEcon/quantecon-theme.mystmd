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

# Assembles the release workflow's bundle into .deploy/$(THEME), which the
# visual/FOUC test harness serves directly (THEME_TEMPLATE=$$PWD/.deploy/$(THEME)).
# The bundle is two self-contained Vite builds (every dependency compiled in,
# so there is no `npm install` to run): server/, which `myst start` runs, and
# renderer/, which `myst build --html` runs (template.yml `build`).
build-theme: check
	rm -rf .deploy/$(THEME)
	mkdir -p .deploy/$(THEME)
	find $(LECTURE)/template -type f -exec cp {} .deploy/$(THEME) \;
	npm run prod:build -w $(LECTURE)
	cp -r $(LECTURE)/build/server .deploy/$(THEME)/server
	cp -r $(LECTURE)/build/renderer .deploy/$(THEME)/renderer
	cp $(LECTURE)/.env.prod .deploy/$(THEME)/.env.prod
	cp $(LECTURE)/CHANGELOG.md .deploy/$(THEME)/CHANGELOG.md
	sed -i.bak "s/VERSION/$(VERSION)/g" .deploy/$(THEME)/package.json && rm .deploy/$(THEME)/package.json.bak
	sed -E "s/^version: .*/version: $(VERSION)/" $(LECTURE)/template.yml > .deploy/$(THEME)/template.yml

# Zips the bundle for testing the release artifact locally, with the same
# contents the release workflow attaches to the GitHub Release.
build-zip: build-theme
	cd .deploy && rm -f $(THEME).zip && zip -rq $(THEME).zip $(THEME) -x "$(THEME)/node_modules/*" "$(THEME)/package-lock.json"
	@echo "Wrote .deploy/$(THEME).zip"
