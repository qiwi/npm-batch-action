import { IDeprecatePackageParams, NpmRegClientWrapper, RegClient } from '@qiwi/npm-batch-client'

import { defaultRateLimit } from '../default'
import { TDeprecationConfig } from '../interfaces'
import { withRateLimit } from '../utils'

export const performDeprecation = async (config: TDeprecationConfig): Promise<void> => {
  const regClient = new RegClient()
  const batchClient = new NpmRegClientWrapper(
    config.registryUrl,
    config.auth,
    withRateLimit<RegClient>(regClient, config.batch?.ratelimit || defaultRateLimit, ['deprecate'])
  )

  return batchClient
    .deprecateBatch(config.data, config.batch?.skipErrors)
    .then(data => processResults(data, config))
}

export const processResults = (results: any[], config: TDeprecationConfig): void => {
  const normalizedResults = config.batch?.skipErrors ? handleSettledResults(results) : results
  const enrichedResults = enrichResults(normalizedResults, config.data)

  printResults(
    getSuccessfulResults(enrichedResults),
    getFailedResults(enrichedResults),
    config.batch?.jsonOutput
  )
}

type TEnrichedBatchResult = {
  result: any
  packageInfo: IDeprecatePackageParams
}

export const enrichResults = (normalizedResults: any[], data: IDeprecatePackageParams[]): TEnrichedBatchResult[] =>
  normalizedResults.map((result, i) => ({ result, packageInfo: data[i] }))

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

export const printResults = (
  successfulPackages: Array<IDeprecatePackageParams>,
  failedPackages: Array<IDeprecatePackageParams & { error: any }>,
  jsonOutput?: boolean,
  logger = console
): void => {
  if (jsonOutput) {
    logger.log(
      JSON.stringify(
        {
          successfulPackages,
          failedPackages
        },
        null, // eslint-disable-line unicorn/no-null
        '\t'
      )
    )
    return
  }

  if (successfulPackages.length > 0) {
    logger.log('Following packages are deprecated successfully:')
    logger.table(successfulPackages, ['packageName', 'version', 'message'])
  }

  if (failedPackages.length > 0) {
    logger.error('Following packages are not deprecated due to errors:')
    logger.table(failedPackages, ['packageName', 'version', 'message', 'error'])
  }
}
