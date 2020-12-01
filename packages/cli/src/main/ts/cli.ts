#!/usr/bin/env node
import meow from 'meow'

import { run } from './runner'

const cli = meow(
  `
    CLI utility for performing batched actions
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

run(cli.flags)
