# @qiwi/npm-batch-cli
CLI utility for performing batched actions
# Installation
```shell script
npm install @qiwi/npm-batch-cli
yarn add @qiwi/npm-batch-cli
```
# Usage
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
        {
            "packageName": "baz", // baz@<1.2.2 will be un-deprecated
            "version": "<1.2.2",
            "message": ""
        }
    ]
}
```
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
    "settings": {
        "rate": {
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
    "settings": {
        "rate": [
            {
                "period": 500,
                "count": 2
            },
            {
                "period": 10000,
                "count": 17
            }
        ]
    },
    ...
}
```
