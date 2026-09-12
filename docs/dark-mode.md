# Dark mode

The header's theme toggle switches between light and dark, honouring the
system preference until the reader chooses. The dark theme uses a `#222` ground
and white text, with dark values for every colour token: links white, the code palette's dark variant, the `seoul256` dark
colours, `#6cb6ff` for the active "On this page" entry and the amber stderr
fold. The choice persists in the browser.

`#222` was taken from the book theme's own dark ground, but that was its
palette before 0.22.0; the release the lecture repositories pin has a
navy-charcoal one. Which palette this theme should use is an open design
question (#187), so the two do not match today.
