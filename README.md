# @qiwi/npm-batch-client-monorepo
[![Build Status](https://travis-ci.com/qiwi/npm-batch-action.svg?token=j2DTAqhDwW39KLCBSUNN&branch=master)](https://travis-ci.com/qiwi/npm-batch-action)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0d25f494f7199f633c8a/test_coverage)](https://codeclimate.com/github/qiwi/npm-batch-action/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/0d25f494f7199f633c8a/maintainability)](https://codeclimate.com/github/qiwi/npm-batch-action/maintainability)

Packages for performing batched actions on NPM registry.

## [@qiwi/npm-batch-client](https://github.com/qiwi/npm-batch-action/tree/master/packages/client)
Wrapper for https://github.com/npm/npm-registry-client with ~~blackjack~~ promises and batch actions.
```typescript
import { NpmRegClientWrapper } from '@qiwi/npm-batch-client'

const wrapper = new NpmRegClientWrapper(
  'https://registry.npmjs.org',
  {
    username: 'username',
    password: 'password'
  }
)
wrapper.deprecate('foo', '<1.2.0', 'foo <1.2.0 contains critical bugs')
```

## [@qiwi/npm-batch-cli](https://github.com/qiwi/npm-batch-action/tree/master/packages/cli)
CLI utility for performing batched npm actions.
```shell script
npx @qiwi/npm-batch-cli --config=config.json
```
`config.json`:
```json
{
    "registryUrl": "https://registry.npmjs.org",
    "auth": {
        "token": "12345678-1234-1234-1234-12345678"
    },
    "action": "deprecate",
    "data": [
        {
            "packageName": "foo",
            "version": "*",
            "message": "foo is deprecated"
        },
        {
            "packageName": "bar",
            "version": "<1.3.2",
            "message": "bar@<1.3.2 contains critical vulnerabilities"
        },
        ...
    ]
}
```
## [@qiwi/npm-batch-cli-pipe](https://github.com/qiwi/npm-batch-action/tree/master/packages/cli-pipe)
The same as `@qiwi/npm-batch-cli`, but with configuring via a pipeline.
```shell script
cat config.json | npx @qiwi/npm-batch-cli-pipe
```

## [@qiwi/npm-batch-cli-api](https://github.com/qiwi/npm-batch-action/tree/master/packages/cli-api)
API for npm-batch CLI utilities.
```typescript
import { readConfigAndRun } from '@qiwi/npm-batch-cli-api'

readConfigAndRun({ config: 'config.json' })
    .then(() => console.log('Done.'))
```

## License
[MIT](./LICENSE)
