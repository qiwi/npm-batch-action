# @qiwi/npm-batch-cli-api
API npm-batch CLI utilities
## Installation
```shell script
npm install @qiwi/npm-batch-cli-api
yarn add @qiwi/npm-batch-cli-api
```
## Usage
```typescript
import { readConfigAndRun } from '@qiwi/npm-batch-cli-api'

readConfigAndRun({ config: 'config.json' })
    .then(() => console.log('Done.'))
```
