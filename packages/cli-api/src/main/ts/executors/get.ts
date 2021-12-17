import {
  INpmRegClientBatchWrapper,
  TGetPackumentResult
} from '@qiwi/npm-batch-client'

import { TGetConfig } from '../interfaces'
import {
  printResults,
  printResultsJson,
  writeToFile
} from '../utils'
import { parseResults } from '../utils/batch'

const isFailed = (item: PromiseFulfilledResult<TGetPackumentResult>): boolean =>
  !item.value || typeof item.value !== 'object' || (item.value as any)?.success === false

export const performGet = async (
  config: TGetConfig,
  batchClient: INpmRegClientBatchWrapper
): Promise<void> => {
  const data = await batchClient.getPackument(config.data, config.batch?.skipErrors)

  const { successful, failed } = parseResults<string, TGetPackumentResult>(config.data, data, isFailed)
  const successfulPackages = successful.map((item) => ({ name: item.opts }))
  const failedPackages = failed.map(item => ({ name: item.opts, reason: item.reason }))
  const packuments = successful.map(item => item.res.value)

  if (config.batch?.jsonOutput) {
    printResultsJson({
      successfulPackages: config.batch?.printOnlyFailed ? undefined : successfulPackages,
      failedPackages,
      packuments
    })
    return
  }

  writeToFile(config.batch?.path as string, packuments)

  printResults(
    config.batch?.printOnlyFailed ? [] : successfulPackages,
    failedPackages,
    ['name'],
    ['name', 'reason'],
    `Packuments of following packages have been written to ${config.batch?.path}:`,
    'Packuments of following packages have not been downloaded because of errors:'
  )
}
