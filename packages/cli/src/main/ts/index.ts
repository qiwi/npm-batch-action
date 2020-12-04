#!/usr/bin/env node
import { readConfigAndRun } from '@qiwi/npm-batch-cli-api'
import meow from 'meow'

const cli = meow(
  `
    CLI utility for performing batched npm actions
    Usage
    @qiwi/npm-batch-cli --input=input.json
    Options
    config - path to config file, see example on https://github.com/qiwi/npm-batch-action/tree/master/packages/cli#readme
  `,
  {
    flags: {
      config: {
        isRequired: true,
        type: 'string',
      }
    }
  }
)

readConfigAndRun(cli.flags)
  .then(() => {
    console.log('Done')
    process.exit(0)
  })
