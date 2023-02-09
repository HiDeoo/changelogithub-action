import { getInput, info, setFailed, setOutput } from '@actions/core'
import * as changelogithub from 'changelogithub'
import { beforeEach, expect, test, vi } from 'vitest'

import { generateChangelog } from '../src/libs/changelog'

import { getActionInputNames, getActionOutputNames } from './utils'

vi.mock('@actions/core', async () => {
  const mod = await vi.importActual<typeof import('@actions/core')>('@actions/core')

  return {
    ...mod,
    getInput: vi.fn().mockReturnValue(''),
    info: vi.fn(),
    setFailed: vi.fn(),
    setOutput: vi.fn(),
  }
})

vi.mock('changelogithub', async () => {
  const mod = await vi.importActual<typeof import('changelogithub')>('changelogithub')

  return {
    ...mod,
    hasTagOnGitHub: vi.fn().mockResolvedValue(true),
    isRepoShallow: vi.fn().mockResolvedValue(false),
    generate: vi.fn().mockResolvedValue({
      commits: [],
      config: {},
      md: '',
    }),
    sendRelease: vi.fn().mockResolvedValue({
      html_url: 'release_url',
      id: 'release_id',
      upload_url: 'release_upload_url',
    }),
  }
})

beforeEach(() => {
  vi.mocked(getInput).mockClear()
  vi.mocked(info).mockClear()
  vi.mocked(setFailed).mockClear()
  vi.mocked(setOutput).mockClear()
})

test('should get all the supported inputs', async () => {
  await generateChangelog()

  const inputNames = getActionInputNames()

  expect(getInput).toHaveBeenCalledTimes(inputNames.optional.length + inputNames.required.length)

  for (const inputName of inputNames.optional) {
    expect(getInput).toHaveBeenCalledWith(inputName, undefined)
  }

  for (const inputName of inputNames.required) {
    expect(getInput).toHaveBeenCalledWith(inputName, { required: true })
  }
})

test('should not define options for input not present in the action', async () => {
  const generateSpy = vi.spyOn(changelogithub, 'generate')

  await generateChangelog()

  // Emojis defaults to false
  // https://github.com/antfu/changelogithub/blob/main/src/cli.ts#L20
  expect(generateSpy).toHaveBeenCalledWith({ emoji: true })
})

test('should use changelogithub to generate the changelog', async () => {
  const generateSpy = vi.spyOn(changelogithub, 'generate')

  await generateChangelog()

  expect(generateSpy).toHaveBeenCalled()
})

test('should bail out for a dry run', async () => {
  const sendReleaseSpy = vi.spyOn(changelogithub, 'sendRelease')

  mockConfig({ dry: true })

  await generateChangelog()

  expect(info).toHaveBeenCalledWith('Dry run. Release skipped.')
  expect(sendReleaseSpy).not.toHaveBeenCalled()
  expect(setFailed).not.toHaveBeenCalled()
})

test('should exit early if no token is provided', async () => {
  const sendReleaseSpy = vi.spyOn(changelogithub, 'sendRelease')

  await generateChangelog()

  expectFailureWithMessage('No GitHub token found, specify it via the `token` action input. Release skipped.')
  expect(sendReleaseSpy).not.toHaveBeenCalled()
})

test('should exit early if the current ref is not a GitHub tag', async () => {
  const hasTagOnGitHubSpy = vi.spyOn(changelogithub, 'hasTagOnGitHub').mockResolvedValueOnce(false)
  const sendReleaseSpy = vi.spyOn(changelogithub, 'sendRelease')

  mockConfig()

  await generateChangelog()

  expect(hasTagOnGitHubSpy).toHaveBeenCalled()

  expectFailureWithMessage(/Current ref "\w+" is not available as tags on GitHub. Release skipped./)
  expect(sendReleaseSpy).not.toHaveBeenCalled()
})

test('should send the release and set the output variables', async () => {
  const sendReleaseSpy = vi.spyOn(changelogithub, 'sendRelease')

  mockConfig()

  await generateChangelog()

  expect(sendReleaseSpy).toHaveBeenCalled()

  const outputNames = getActionOutputNames()

  expect(setOutput).toHaveBeenCalledTimes(outputNames.length)

  for (const outputName of outputNames) {
    expect(setOutput).toHaveBeenCalledWith(outputName, outputName)
  }

  expect(setFailed).not.toHaveBeenCalled()
})

test('should exit if the repo is cloned shallowly', async () => {
  vi.spyOn(changelogithub, 'isRepoShallow').mockResolvedValueOnce(true)

  mockConfig()

  await generateChangelog()

  expectFailureWithMessage(/The repo seems to be cloned shallowly/)
})

function expectFailureWithMessage(message: string | RegExp) {
  expect(setFailed).toHaveBeenCalled()
  expect(vi.mocked(setFailed).mock.lastCall).toContainEqual(expect.stringMatching(message))
}

function mockConfig(config: changelogithub.ChangelogOptions = {}) {
  vi.spyOn(changelogithub, 'generate').mockResolvedValueOnce({
    commits: [],
    config: { token: '123456', ...config } as Required<changelogithub.ChangelogOptions>,
    md: '',
  })
}
