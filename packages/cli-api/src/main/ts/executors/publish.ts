import {
  INpmRegClientWrapper,
  NpmRegClientWrapper,
  RegClient,
  TBatchResult,
  TPublishResult,
  TTarballOpts
} from '@qiwi/npm-batch-client'

import { defaultRateLimit } from '../default'
import { TPublishConfig } from '../interfaces'
import { printResults, printResultsJson, withRateLimit } from '../utils'

export const performPublish = (
  config: TPublishConfig,
  customBatchClient?: INpmRegClientWrapper
): Promise<void> => {
  const regClient = new RegClient()
  const batchClient = customBatchClient || new NpmRegClientWrapper(
    config.registryUrl,
    config.auth,
    withRateLimit<RegClient>(regClient, config.batch?.ratelimit || defaultRateLimit, ['publish'])
  )

  return batchClient.publishBatch(config.data)
    .then(data => processPublishResults(data, config))
    .catch(console.error)
}

type TEnrichedResult = {
  result: TBatchResult<TPublishResult>
  params: TTarballOpts
}

export const processPublishResults = (results: TBatchResult<TPublishResult>[], config: TPublishConfig): void => {
  const enrichedResults: TEnrichedResult[] = results
    .map((result, i) => ({ result, params: config.data[i] }))

  const successfulPackages = enrichedResults
    .filter((item) => item.result.status === 'fulfilled' && item.result.value.success)
    .map(item => item.params)

  const failedPackages = enrichedResults
    .filter((item) => item.result.status === 'rejected' || !item.result.value.success)
    .map((item: TEnrichedResult) => ({
      ...item.params,
      error: item.result.status === 'rejected' ? item.result.reason : 'no data'
    }))

  if (config.batch?.jsonOutput) {
    printResultsJson(successfulPackages, failedPackages)
    return
  }

  printResults(
    successfulPackages,
    failedPackages,
    ['name', 'version', 'filePath', 'access'],
    ['name', 'version', 'filePath', 'access', 'error'],
    'Following packages are published successfully:',
    'Following packages are not published due to errors:',
  )
}
