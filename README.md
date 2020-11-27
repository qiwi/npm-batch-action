# @qiwi/npm-batch-action
Packages for performing batched actions on NPM registry.

## [@qiwi/npm-batch-client-wrapper](https://github.com/qiwi/npm-batch-action/tree/master/packages/wrapper)
Wrapper for https://github.com/npm/npm-registry-client with ~~blackjack~~ promises and batch actions.
```typescript
import { NpmRegClientWrapper } from '@qiwi/npm-batch-client-wrapper'

const wrapper = new NpmRegClientWrapper(
  'https://registry.npmjs.org',
  {
    username: 'username',
    password: 'password'
  }
)
wrapper.deprecate('foo', '<1.2.0', 'foo <1.2.0 contains critical bugs')
```
