import { IDeprecatePackageParams, TDeprecateResult, } from '@qiwi/npm-batch-client'

import { TActionPerformer, TDeprecationConfig } from '../interfaces'
import { printResults, printResultsJson } from '../utils'
import { parseResults } from '../utils/batch'

export const performDeprecation: TActionPerformer = async (
  config: TDeprecationConfig,
  batchClient
): Promise<void> => {
  const data = await batchClient.deprecate(config.data, config.batch?.skipErrors)

  const { successful, failed } = parseResults<IDeprecatePackageParams, TDeprecateResult>(config.data, data)
  const successfulResults = successful.map((item) => item.opts)
  const failedResults = failed.map(item => ({ ...item.opts, reason: item.reason }))

  if (config.batch?.jsonOutput) {
    printResultsJson({
      successfulResults: config.batch?.printOnlyFailed ? undefined : successfulResults,
      failedResults
    })
    return
  }

  printResults(
    config.batch?.printOnlyFailed ? [] : successfulResults,
    failedResults,
    ['packageName', 'version', 'message'],
    ['packageName', 'version', 'message', 'error'],
    'Following packages are deprecated successfully:',
    'Following packages are not deprecated due to errors:'
  )
}
