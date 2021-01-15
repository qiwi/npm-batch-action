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
```text
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
## Publishing
You should specify a path in `filePath` to `.tar.gz` archive of package to publish.
Access may be `publish` or `restricted`.
```json
{
    "registryUrl": "https://registry.npmjs.org",
    "auth": {
        "username": "username",
        "password": "password",
        "email": "email@email.com"
    },
    "action": "publish",
    "data": [
        {
            "name": "@test/package-12-01-21-1",
            "version": "1.0.0",
            "filePath": "test-package-12-01-21-1.tar.gz",
            "access": "public"
        },
        {
            "name": "@test/package-12-01-21-5",
            "version": "1.0.0",
            "filePath": "test-package-12-01-21-2.tar.gz",
            "access": "public"
        }
    ]
}
```
Output:
```text
Following packages are published successfully:
┌─────────┬────────────────────────────┬─────────┬──────────────────────────────────┬──────────┐
│ (index) │            name            │ version │             filePath             │  access  │
├─────────┼────────────────────────────┼─────────┼──────────────────────────────────┼──────────┤
│    0    │ '@test/package-15-01-21-1' │ '1.0.0' │ 'test-package-15-01-21-1.tar.gz' │ 'public' │
│    1    │ '@test/package-15-01-21-2' │ '1.0.0' │ 'test-package-15-01-21-2.tar.gz' │ 'public' │
│    2    │ '@test/package-15-01-21-3' │ '1.0.0' │ 'test-package-15-01-21-2.tar.gz' │ 'public' │
└─────────┴────────────────────────────┴─────────┴──────────────────────────────────┴──────────┘
```
# Authorization
You can use authorization via token as in example of [deprecation](#deprecationun-deprecation), or username/password and email as in example of [publishing](#publishing)
# Configuration
You can specify configuration options in `batch` root field of config object.
## Throttling
Utility limits request rate to registry. By default, utility makes maximum 10 requests per second.
You can specify your own rate limit.
In this example maximum 2 requests per 500 ms will be made.
```json
{
    "registryUrl": "https://registry.npmjs.org",
    "auth": {
        "username": "username",
        "password": "password",
        "email": "email@email.com"
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
        "password": "password",
        "email": "email@email.com"
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
## Other settings
Flag `skipErrors` allows utility to continue on errors.
```json
{
    ...
    "batch": {
        "skipErrors": true
    },
    ...
}
```
Flag `jsonOutput` prints result in JSON format.
```json
{
    ...
    "batch": {
        "jsonOutput": true
    },
    ...
}
```
