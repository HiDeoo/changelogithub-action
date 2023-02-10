<div align="center">
  <h1>changelogithub-action 📚</h1>
  <p>GitHub Action to generate Changelog for GitHub releases from Conventional Commits.</p>
</div>

<div align="center">
  <a href="https://github.com/HiDeoo/changelogithub-action/actions/workflows/integration.yml">
    <img alt="Integration Status" src="https://github.com/HiDeoo/changelogithub-action/actions/workflows/integration.yml/badge.svg" />
  </a>
  <a href="https://github.com/HiDeoo/changelogithub-action/blob/main/LICENSE">
    <img alt="License" src="https://badgen.net/github/license/HiDeoo/changelogithub-action" />
  </a>
  <br />
</div>

## Features

This GitHub action is a small wrapper for [`changelogithub`](https://github.com/antfu/changelogithub) to generate Changelog for GitHub releases from Conventional Commits.

Created by [Anthony Fu](https://github.com/antfu) who deserves all the credits, `changelogithub` is a great tool but is [not a GitHub Action](https://github.com/antfu/changelogithub/issues/5#issuecomment-1154179110) which makes it a bit more difficult to get the newly created release ID or URL as output variables.

This GitHub Action uses a [slightly patched](/patches/changelogithub%400.12.7.patch) version of `changelogithub` to access the GitHub API response returned when creating a release and outputs the _release ID_, _release URL_ and _release upload URL_ as output variables.

## Usage

You can also check out the [`changelogithub` documentation](https://github.com/antfu/changelogithub#usage) for more informations.

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16

      - name: Generate changelog
        uses: hideoo/changelogithub-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

> **Note**
> You can also use the `hideoo/changelogithub-action@v1.x.x` syntax to pin the action to a specific version.

### Inputs

Inputs are specified using the `with` keyword. For example:

```yaml
- uses: hideoo/changelogithub-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    emoji: false
    prerelease: true
```

The following inputs are available:

| Name           | Description                                                                     | Required |
| -------------- | ------------------------------------------------------------------------------- | :------: |
| `token`        | The GitHub Token to use.                                                        |    ✅    |
| `capitalize`   | Capitalize commit messages.                                                     |          |
| `contributors` | Whether to include contributors in release notes.                               |          |
| `draft`        | Mark the release as a draft.                                                    |          |
| `dry`          | Dry run. Skip releasing to GitHub.                                              |          |
| `emoji`        | Use emojis in section titles.                                                   |          |
| `from`         | The start commit reference. When not provided, the latest git tag is used.      |          |
| `github`       | The owner/repository identifier.                                                |          |
| `group`        | Nest commit messages under their scopes.                                        |          |
| `name`         | Name of the release.                                                            |          |
| `prerelease`   | Mark the release as prerelease.                                                 |          |
| `to`           | The end commit reference. When not provided, the latest commit in HEAD is used. |          |

### Outputs

Outputs can be accessed using the `steps.<step_id>.outputs.<output_name>` syntax. For example:

```yaml
- uses: hideoo/changelogithub-action@v1
  id: changelog
  with:
    token: ${{ secrets.GITHUB_TOKEN }}

- name: Get the release ID
  run: echo "The release ID is ${{ steps.changelog.outputs.release_id }}"
```

The following outputs are available:

| Name                 | Description                 |
| -------------------- | --------------------------- |
| `release_id`         | The new release ID.         |
| `release_url`        | The new release URL.        |
| `release_upload_url` | The new release upload URL. |

## License

Licensed under the MIT License, Copyright © HiDeoo.

See [LICENSE](https://github.com/HiDeoo/changelogithub-action/blob/main/LICENSE) for more information.
