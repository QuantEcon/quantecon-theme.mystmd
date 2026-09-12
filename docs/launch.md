# Launch buttons

The header's launch control opens the page's notebook in **Google Colab**, the
single launch target the deployed lecture sites offer. BinderHub and a private
JupyterHub are deliberately not offered (theme issues #26 and #87). Running
cells in place is a separate feature; see [notebooks](notebooks.md).

**Launch is opt-in.** It renders only when a site both names a notebook
repository and turns a launch service on:

```yaml
site:
  options:
    launch_notebook_repo: QuantEcon/lecture-foo.notebooks
    launch_colab: true
```

With either unset there is no Launch control, on the desktop toolbar or in the
mobile overflow menu. Nothing is derived from `project.github`, so a site
without a notebooks repository cannot end up linking readers to one that does
not exist. Set `launch_notebook_repo` only when that repository really exists.

| Option | Default | Purpose |
| --- | --- | --- |
| `launch_notebook_repo` | — | notebook repository, as a full URL or `org/repo` |
| `launch_notebook_branch` | `main` | branch in the notebook repo |
| `launch_notebook_dir` | — | sub-directory of the notebook repo holding the notebooks |
| `launch_notebook_source_dir` | — | prefix stripped from the page path (e.g. `lectures/`) |
| `launch_colab` | off | offer Google Colab |

The `launch_notebook_*` group says where the notebook lives; `launch_colab`
says what can open it. They are kept apart because one notebook source serves
every service, so a service is not a property of the source.

The names are flat only because template options cannot yet be structured.
Each is the nested path it becomes when they can (`launch.notebook.repo`,
`launch.colab` — QuantEcon/mystmd#112), so that migration is mechanical.

## Coming from quantecon-book-theme

| Sphinx key | Theme option |
| --- | --- |
| `nb_repository_url` | `launch_notebook_repo` |
| `nb_branch` | `launch_notebook_branch` |
| `nb_path_to_notebooks` | `launch_notebook_dir` |
| `path_to_docs` | `launch_notebook_source_dir` |
| `launch_buttons.colab_url` | `launch_colab: true` |
