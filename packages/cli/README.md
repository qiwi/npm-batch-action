# @qiwi/npm-batch-cli
CLI utility for performing batched npm actions
## Installation
```shell script
npm install @qiwi/npm-batch-cli
yarn add @qiwi/npm-batch-cli
```
## Usage
```shell script
@qiwi/npm-batch-cli --config=some/path/config.json
```
You can call thus utility without installation via `npx`
```shell script
npx @qiwi/npm-batch-cli --config=some/path/config.json
```
Output:
```text
info attempt registry request try #1 at 8:28:25 PM
http request GET https://registry.npmjs.org/gen-tree-lib?write=true
info attempt registry request try #1 at 8:28:25 PM
http request GET https://registry.npmjs.org/foobarbazbat?write=true
http 404 https://registry.npmjs.org/foobarbazbat?write=true
http 200 https://registry.npmjs.org/gen-tree-lib?write=true
info attempt registry request try #1 at 8:28:26 PM
http request PUT https://registry.npmjs.org/gen-tree-lib
http 200 https://registry.npmjs.org/gen-tree-lib
Following packages are deprecated successfully:
┌─────────┬────────────────┬─────────┬──────────────────────────────┐
│ (index) │  packageName   │ version │           message            │
├─────────┼────────────────┼─────────┼──────────────────────────────┤
│    0    │ 'gen-tree-lib' │   '*'   │ 'gen-tree-lib is deprecated' │
└─────────┴────────────────┴─────────┴──────────────────────────────┘

Following packages are not deprecated due to errors:
┌─────────┬────────────────┬──────────┬─────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────┐
│ (index) │  packageName   │ version  │                         message                         │                                         error                                         │
├─────────┼────────────────┼──────────┼─────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
│    0    │ 'foobarbazbat' │ '<1.3.2' │ 'foobarbazbat@<1.3.2 contains critical vulnerabilities' │ 'Registry returned 404 for GET on https://registry.npmjs.org/foobarbazbat?write=true' │
└─────────┴────────────────┴──────────┴─────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```

# Config file example
## Deprecation/Un-deprecation
If you want to un-deprecate package, pass empty message.
In this example all versions of `gen-tree-lib` and `foobarbazbat@<1.3.2` will be deprecated, `baz@<1.2.2` will be un-deprecated.
```json
{
    "registryUrl": "https://registry.npmjs.org",
    "auth": {
        "token": "12345678-1234-1234-1234-12345678"
    },
    "action": "deprecate",
    "data": [
        {
            "packageName": "gen-tree-lib",
            "version": "*",
            "message": "gen-tree-lib is deprecated"
        },
        {
            "packageName": "foobarbazbat",
            "version": "<1.3.2",
            "message": "foobarbazbat@<1.3.2 contains critical vulnerabilities"
        },
        {
            "packageName": "baz",
            "version": "<1.2.2",
            "message": ""
        }
    ]
}

```
Output:

You can use authorization via token as in example above, or simple username and password pair:
```json
{
    "registryUrl": "https://registry.npmjs.org",
    "auth": {
        "username": "username",
        "password": "password"
    },
    ...
}
```
# Throttling
Utility limits request rate to registry. By default, utility makes maximum 10 requests per second.
You can specify your own rate limit.
In this example maximum 2 requests per 500 ms will be made.
```json
{
    "registryUrl": "https://registry.npmjs.org",
    "auth": {
        "username": "username",
        "password": "password"
    },
    "batch": {
        "ratelimit": {
            "period": 500,
            "count": 2
        }
    },
    ...
}
```
You can specify several rate limits:
```json
{
    "registryUrl": "https://registry.npmjs.org",
    "auth": {
        "username": "username",
        "password": "password"
    },
    "batch": {
        "skipErrors": true,
        "ratelimit": [
            {
                "period": 500,
                "count": 2
            },
            {
                "period": 10000,
                "count": 17
            }
        ],
        "jsonOutput": true
    },
    ...
}
```
Flag `skipErrors` allows utility to continue on errors.
Flag `jsonOutput` prints result in JSON format.
