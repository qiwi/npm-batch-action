# @qiwi/npm-batch-client-monorepo
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
@qiwi/npm-batch-cli --config=config.json
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

