import * as core from '@actions/core'
import { generate, hasTagOnGitHub, isRepoShallow, sendRelease } from 'changelogithub'

import { getInputOptions, setReleaseOutput } from './libs/action'

async function run() {
  try {
    const inputOptions = getInputOptions()

    const { commits, config, md } = await generate(inputOptions)

    if (config.dry) {
      core.info('Dry run. Release skipped.')
      return
    }

    if (!config.token) {
      throw new Error('No GitHub token found, specify it via the `token` action input. Release skipped.')
    }

    if (!(await hasTagOnGitHub(config.to, config))) {
      throw new Error(`Current ref "${config.to}" is not available as tags on GitHub. Release skipped.`)
    }

    const release = await sendRelease(config, md)

    setReleaseOutput(release)

    if (commits.length === 0 && (await isRepoShallow())) {
      throw new Error(
        'The repo seems to be cloned shallowly, which make changelog failed to generate. You might want to specify `fetch-depth: 0` in your CI config.'
      )
    }
  } catch (error) {
    core.setFailed(`Action changelogithub failed with error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

run()
