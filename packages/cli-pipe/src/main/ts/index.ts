#!/usr/bin/env node
import { run } from '@qiwi/npm-batch-cli-api'

const stdin = process.openStdin()

let configRaw = ''

stdin.on('data', (chunk) => {
  configRaw += chunk
})

stdin.on('end', () =>
  run(configRaw)
    .then(() => process.exit())
    .catch(e => {
      console.error(e)
      process.exit(1)
    })
)
