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

# Config file
```json

```
# Throttling
By default, utility limits request rate to registry. You can specify your own settings as `--rate` option.

