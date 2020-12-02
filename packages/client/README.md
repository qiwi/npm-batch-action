# @qiwi/npm-batch-client
Wrapper for https://github.com/npm/npm-registry-client with ~~blackjack~~ promises and batch actions.
# Installation
```shell script
npm install @qiwi/npm-batch-client
yarn add @qiwi/npm-batch-client
```
# Usage
## Creating an instance
```typescript
import { NpmRegClientWrapper, RegClient } from '@qiwi/npm-batch-client'

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

## Get info about package
```typescript
wrapper.get('@types/react')
  .then(console.log)
/*
{
    "_id": "foo",
    "_rev": "12-116b13c5b065b01fc85f3b4034414b2c",
    "name": "foo",
    "dist-tags": {
        "latest": "1.2.0"
    },
    "versions": {
        "1.1.0": {
    ...
}
*/
```
## Get info about packages by list
```typescript
const packageNames = [
  'foo',
  'bar',
  'baz'
]

wrapper.getBatch(packageNames)
  .then(console.log)
/*
[
    {
        "_id": "foo",
        "_rev": "12-12345678123456781234567812345678",
        "name": "foo",
        "dist-tags": {
            "latest": "1.2.0"
        },
        "versions": {
            "1.1.0": {
        ...
    },
    {
        "_id": "bar",
        "_rev": "12-12345678123456781234567812345679",
        "name": "bar",
        "dist-tags": {
            "latest": "1.2.0"
        },
        "versions": {
            "1.1.0": {
        ...
    },
    ...
]
*/
wrapper.getBatch(packageNames, true) // if you want to ignore errors when executing a batch actions

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
wrapper.deprecateBatch(params, true) // if you want to ignore errors when executing a batch of actions
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
wrapper.unDeprecateBatch(params, true) // if you want to ignore errors when executing a batch of actions
```
