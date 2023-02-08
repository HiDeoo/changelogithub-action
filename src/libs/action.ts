import * as core from '@actions/core'
import { type ChangelogOptions, type GitHubRelease } from 'changelogithub'

export function getInputOptions(): ChangelogOptions {
  return {
    capitalize: getBooleanInput('capitalize'),
    contributors: getBooleanInput('contributors'),
    draft: getBooleanInput('draft'),
    dry: getBooleanInput('dry'),
    emoji: getBooleanInput('emoji'),
    from: core.getInput('from'),
    github: core.getInput('github'),
    group: getBooleanInput('group'),
    name: core.getInput('name'),
    prerelease: getBooleanInput('prerelease'),
    to: core.getInput('to'),
    token: core.getInput('token', { required: true }),
  }
}

export function setReleaseOutput({ html_url, id, upload_url }: GitHubRelease) {
  core.setOutput('release_id', id)
  core.setOutput('release_url', html_url)
  core.setOutput('release_upload_url', upload_url)
}

function getBooleanInput(name: string) {
  return core.getInput(name) === 'true'
}
