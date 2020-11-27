# @qiwi/npm-batch-client-wrapper
Wrapper for https://github.com/npm/npm-registry-client with ~~blackjack~~ promises and batch actions.
# Installation
```shell script
npm install @qiwi/npm-batch-client-wrapper
yarn add @qiwi/npm-batch-client-wrapper
```
# Usage
## Creating an instance
```typescript
import { NpmRegClientWrapper } from '@qiwi/npm-batch-client-wrapper'
import RegClient from 'npm-registry-client'

const wrapper = new NpmRegClientWrapper(
  'https://registry.npmjs.org',
  {
    username: 'username',
    password: 'password'
  }
)

// You can use authorization via token
const wrapperWithTokenAuth = new NpmRegClientWrapper(
  'https://registry.npmjs.org',
  {
    token: 'your token',
  }
)

// You can pass your own npm-registry-client instance as third argument to constructor.
const wrapperWithCustomClientInstance = new NpmRegClientWrapper(
  'https://registry.npmjs.org',
  {
    token: 'your token',
  },
  new RegClient(yourCustomConfig)
)
```

## Deprecate package version by given range and with given message
```typescript
wrapper.deprecate('foo', '<1.2.0', 'foo <1.2.0 contains critical bugs')
```

## Deprecate list of packages
```typescript
 const params = [
  {
    packageName: 'foo',
    version: '>1.1.0',
    message: 'foo is deprecated'
  },
  {
    packageName: 'bar',
    version: '*',
    message: 'bar is deprecated'
  },
  {
    packageName: 'baz',
    version: '<1.2.0',
    message: 'baz is deprecated'
  },
]
wrapper.deprecateBatch(params)
```

## Un-deprecate list of packages
```typescript
 const params = [
  {
    packageName: 'foo',
    version: '>1.1.0'
  },
  {
    packageName: 'bar',
    version: '*'
  },
  {
    packageName: 'baz',
    version: '<1.2.0'
  },
]
wrapper.unDeprecateBatch(params)
```
