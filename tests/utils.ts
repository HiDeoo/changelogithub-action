import fs from 'node:fs'

import { type ActionDefinition } from '@xt0rted/actions-toolkit'
import YAML from 'yaml'

let manifest: ActionDefinition | undefined

export function getActionInputNames() {
  const inputNames = getActionManifest().inputs

  const required: string[] = []
  const optional: string[] = []

  for (const [name, input] of Object.entries(inputNames)) {
    if (input.required) {
      required.push(name)
    } else {
      optional.push(name)
    }
  }

  return { optional, required }
}

export function getActionOutputNames() {
  return Object.keys(getActionManifest().outputs)
}

function getActionManifest(): ActionDefinition {
  if (manifest) {
    return manifest
  }

  const file = fs.readFileSync('./action.yml', 'utf8')
  manifest = YAML.parse(file) as ActionDefinition

  return manifest
}
