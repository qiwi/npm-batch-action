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
## Getting
Packuments (json files with meta from NPM-registry) of given packages will be written to a file, specified by `batch.path`.
```json
{
    "registryUrl": "https://registry.npmjs.org",
    "auth": {
        "username": "username",
        "password": "password",
        "email": "email@email.com"
    },
    "batch": {
        "path": "results.json",
        "skipErrors": true
    },
    "action": "get",
    "data": [
        "gen-tree-lib",
        "react-dom",
        "@qiwi/foo"
    ]
}
```
Output in console:
```text
Packuments of following packages have been written to results.json:
┌─────────┬────────────────┐
│ (index) │      name      │
├─────────┼────────────────┤
│    0    │ 'gen-tree-lib' │
│    1    │  'react-dom'   │
└─────────┴────────────────┘
Packuments of following packages have not been downloaded because of errors:
┌─────────┬─────────────┬─────────────────────────┐
│ (index) │    name     │          error          │
├─────────┼─────────────┼─────────────────────────┤
│    0    │ '@qiwi/foo' │ 'Not found : @qiwi/foo' │
└─────────┴─────────────┴─────────────────────────┘

```
results.json:
```text
[
    {
        "name": "gen-tree-lib",
        "value": {
            "_id": "gen-tree-lib",
            "_rev": "48-583faf615cd38b2ad8c28e6c47bac7ec",
            "name": "gen-tree-lib",
            "dist-tags": {
                "latest": "1.8.0"
            },
            ...
        }
    },
    {
        "name": "react-dom",
        "value": {
            "_id": "react-dom",
            "_rev": "619-c672e11f0a03532f37e89a9ea3a57551",
            "name": "react-dom",
            "description": "React package for working with the DOM.",
            "dist-tags": {
                "latest": "17.0.1",
                "next": "0.0.0-8e5adfbd7",
                "experimental": "0.0.0-experimental-27659559e",
                "untagged": "16.14.0"
            },
            ...
        }
    }
]
```
If `batch.jsonOutput` is `true` then utility will log all output in JSON format. 
```json
{
    "registryUrl": "https://registry.npmjs.org",
    "auth": {
        "username": "username",
        "password": "password",
        "email": "email@email.com"
    },
    "batch": {
        "jsonOutput": true,
        "skipErrors": true
    },
    "action": "get",
    "data": [
        "gen-tree-lib",
        "react-dom",
        "@qiwi/foo"
    ]
}
```
Output:
```text
{
    "successfulPackages": [
        {
            "name": "gen-tree-lib"
        },
        {
            "name": "react-dom"
        }
    ],
    "failedPackages": [
        {
            "name": "@qiwi/foo",
            "error": "Not found : @qiwi/foo"
        }
    ],
    "packuments": [
        {
            "name": "gen-tree-lib",
            "value": {
                "_id": "gen-tree-lib",
                "_rev": "48-583faf615cd38b2ad8c28e6c47bac7ec",
                "name": "gen-tree-lib",
                "dist-tags": {
                    "latest": "1.8.0"
                },
                "versions": {
                ...
                }
            }
        },
        ...
    ]
} 
```
# Authorization
You can use authorization via token as in example of [deprecation](#deprecationun-deprecation), or username/password and email as in example of [publishing](#publishing)
# Configuration
You can specify configuration options in `batch` root field of config object.
## Throttling
Utility limits request rate to registry. By default, utility makes maximum 10 requests per second.
You can specify your own rate limit.
In this example maximum 2 requests per 500 ms will be made.
```text
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
```text
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
```text
{
    ...
    "batch": {
        "skipErrors": true
    },
    ...
}
```
Flag `jsonOutput` prints result in JSON format.
```text
{
    ...
    "batch": {
        "jsonOutput": true
    },
    ...
}
```
