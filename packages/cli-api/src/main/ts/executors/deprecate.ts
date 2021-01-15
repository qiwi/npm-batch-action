import { IDeprecatePackageParams, INpmRegClientWrapper, RegClient } from '@qiwi/npm-batch-client'

import { TDeprecationConfig } from '../interfaces'
import { npmRegClientWrapperFactory, printResults, printResultsJson } from '../utils'

export const performDeprecation = async (
  config: TDeprecationConfig,
  customBatchClient?: INpmRegClientWrapper
): Promise<void> => {
  const batchClient = customBatchClient || npmRegClientWrapperFactory(config, ['deprecate'], new RegClient())

  return batchClient
      .deprecateBatch(config.data)
      .then(data => processResults(handleSettledResults(data), config))
}

export const processResults = (results: any[], config: TDeprecationConfig): void => {
  const enrichedResults = enrichResults(results, config.data)
  const successfulResults = getSuccessfulResults(enrichedResults)
  const failedResults = getFailedResults(enrichedResults)

  if (config.batch?.jsonOutput) {
    printResultsJson(
      successfulResults,
      failedResults
    )
    return
  }

  printResults(
    successfulResults,
    failedResults,
    ['packageName', 'version', 'message'],
    ['packageName', 'version', 'message', 'error'],
    'Following packages are deprecated successfully:',
    'Following packages are not deprecated due to errors:'
  )
}

type TEnrichedBatchResult = {
  result: any
  packageInfo: IDeprecatePackageParams
}

export const enrichResults = (results: any[], data: IDeprecatePackageParams[]): TEnrichedBatchResult[] =>
  results.map((result, i) => ({ result, packageInfo: data[i] }))

export const handleSettledResults = (results: PromiseSettledResult<any>[]): any[] =>
  results.map(result => result.status === 'rejected'
    ? result.reason
    : result.value
  )

export const getSuccessfulResults = (
  results: TEnrichedBatchResult[]
): IDeprecatePackageParams[] =>
  results
    .filter(item => item.result === null)
    .map(item => item.packageInfo)

export const getFailedResults = (
  results: TEnrichedBatchResult[]
): Array<IDeprecatePackageParams & { error: any }> =>
  results
    .filter(item => item.result !== null)
    .map(item => ({ ...item.packageInfo, error: item.result.message || item.result }))
