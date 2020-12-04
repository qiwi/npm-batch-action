#!/usr/bin/env node
import { run } from '@qiwi/npm-batch-cli-api'
const stdin = process.openStdin()

let configRaw = ''

stdin.on('data', (chunk) => {
  configRaw += chunk
})

stdin.on('end', async () => {
  await run(configRaw)
  process.exit()
})
