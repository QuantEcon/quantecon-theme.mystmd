# Text colour schemes

Emphasis, strong text and definition terms render in the Sphinx sites' default
`seoul256` scheme: teal `em`, amber `strong` and `dt`, both upright at weight
550, alongside the existing inline-literal colour. They are custom properties
with dark-mode values:

| Property | Light | Dark |
| --- | --- | --- |
| `--qe-emphasis-color` | `#005f5f` | `#5fafaf` |
| `--qe-strong-color` | `#875f00` | `#d7af5f` |
| `--qe-definition-color` | strong | strong |
| `--qe-literal-color` | `#af5f5f` | `#d78787` |
| `--qe-link-color` | `#0072bc` | `#fff` |

Only the default scheme ships: no lecture repository sets `color_scheme`, so the
`gruvbox` and `none` switches and the custom-CSS hook are deferred until a
consumer asks for one.
