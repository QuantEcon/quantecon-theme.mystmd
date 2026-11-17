.PHONY: check build-theme build-zip build-book build-book-zip

# Releases ship via the tag-triggered GitHub Release workflow
# (.github/workflows/release.yml) — see CONTRIBUTING.md "Releases".
#
# The lecture theme lives in the themes/lecture workspace; its bundle is still
# assembled at the repository root, in .deploy/$(THEME), so the test harness,
# the preview workflow and THEME_TEMPLATE paths are unchanged.

THEME = quantecon-theme
LECTURE = themes/lecture
VERSION = $(shell jq -r '.version' $(LECTURE)/package.json)

# The book theme (themes/book) ships separately, as $(BOOK_THEME).zip on
# `book-v*` tags (.github/workflows/release-book.yml).
BOOK_THEME = quantecon-theme-book
BOOK = themes/book
BOOK_VERSION = $(shell jq -r '.version' $(BOOK)/package.json)

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

# The book theme's bundle, assembled into .deploy/$(BOOK_THEME) the same way
# (point a book's `site.template` at that folder to try it).
build-book: check
	rm -rf .deploy/$(BOOK_THEME)
	mkdir -p .deploy/$(BOOK_THEME)
	find $(BOOK)/template -type f -exec cp {} .deploy/$(BOOK_THEME) \;
	npm run prod:build -w $(BOOK)
	cp -r $(BOOK)/public .deploy/$(BOOK_THEME)/public
	cp -r $(BOOK)/build .deploy/$(BOOK_THEME)/build
	cp $(BOOK)/CHANGELOG.md .deploy/$(BOOK_THEME)/CHANGELOG.md
	sed -i.bak "s/VERSION/$(BOOK_VERSION)/g" .deploy/$(BOOK_THEME)/package.json && rm .deploy/$(BOOK_THEME)/package.json.bak
	sed -E "s/^version: .*/version: $(BOOK_VERSION)/" $(BOOK)/template.yml > .deploy/$(BOOK_THEME)/template.yml
	cd .deploy/$(BOOK_THEME) && npm install

build-book-zip: build-book
	cd .deploy && rm -f $(BOOK_THEME).zip && zip -rq $(BOOK_THEME).zip $(BOOK_THEME) -x "$(BOOK_THEME)/node_modules/*"
	@echo "Wrote .deploy/$(BOOK_THEME).zip"
