import { INpmRegClientWrapper, Packument, RegClient, TBatchResult } from '@qiwi/npm-batch-client'

import { TGetConfig } from '../interfaces'
import { npmRegClientWrapperFactory, printResults, printResultsJson, writeToFile } from '../utils'

export const performGet = (
  config: TGetConfig,
  customBatchClient?: INpmRegClientWrapper
): Promise<void> => {
  const batchClient = customBatchClient || npmRegClientWrapperFactory(config, ['get'], new RegClient())

  return batchClient.getBatch(config.data, config.batch?.skipErrors)
    .then(results => processGetResults(results, config))
}

export const isResultSuccessful = (
  item: PromiseSettledResult<Packument>
): item is PromiseFulfilledResult<Packument> & { name: string } =>
  item.status === 'fulfilled' &&
  typeof item.value === 'object' &&
  item.value !== null &&
  !(item.value as any).error

export const isResultFailed = (item: PromiseSettledResult<Packument>): boolean =>
  item.status === 'rejected' ||
  typeof item.value !== 'object' ||
  !item.value ||
  (item.value as any).error

export const getErrorMessage = (item: PromiseSettledResult<Packument>): string =>
  item.status === 'rejected'
    ? item.reason?.message ?? item.reason
    : `got ${typeof item.value === 'object' ? JSON.stringify(item.value) : item.value} instead of Packument`


export const processGetResults = (
  results: TBatchResult<Packument>[],
  config: TGetConfig
): void => {
  const enrichedResults = results.map((item, i) => ({ ...item, name: config.data[i] }))
  const packuments = enrichedResults
    .filter(isResultSuccessful)
    .map(({ name, value }) => ({ name, value }))
  const successfulPackages = packuments.map(({ name }) => ({ name }))
  const failedPackages = enrichedResults
    .filter(isResultFailed)
    .map(item => ({ name: item.name, error: getErrorMessage(item) }))

  if (config.batch?.jsonOutput) {
    printResultsJson({
      successfulPackages,
      failedPackages,
      packuments
    })
    return
  }

  writeToFile(config.batch?.path as string, packuments)

  printResults(
    successfulPackages,
    failedPackages,
    ['name'],
    ['name', 'error'],
    `Packuments of following packages have been written to ${config.batch?.path}:`,
    'Packuments of following packages have not been downloaded because of errors:'
  )
}
