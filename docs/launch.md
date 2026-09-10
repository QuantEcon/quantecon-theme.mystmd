# Launch buttons

The header's launch control opens the page's notebook in **Google Colab**, the
single launch target the deployed lecture sites offer. BinderHub and a private
JupyterHub are deliberately not offered (theme issues #26 and #87). Running
cells in place is a separate feature; see [notebooks](notebooks.md).

The notebook is looked up in a companion repository, by convention
`<project.github>.notebooks` on branch `main`, with the page path used as-is.
Five `site.options` keys adjust that, mirroring the book theme's
`launch_buttons` settings; all are optional and the defaults reproduce the
convention:

| Option | Default | Purpose |
| --- | --- | --- |
| `launch_repo_suffix` | `.notebooks` | suffix appended to the source repo to locate the notebook repo |
| `launch_branch` | `main` | branch in the notebook repo |
| `launch_repo_url` | derived | explicit notebook repository (full URL or `org/repo`) |
| `launch_notebooks_path` | — | sub-directory of the notebook repo holding the notebooks |
| `launch_source_path` | — | prefix stripped from the page path (e.g. `lectures/`) |

A `.myst` suffix on the source repository is dropped when deriving the notebook
repository, so `lecture-python.myst` launches from `lecture-python.notebooks`.
