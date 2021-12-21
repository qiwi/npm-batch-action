import {
  TSetLatestTagOpts,
  TSetLatestTagResult
} from '@qiwi/npm-batch-client'

import { TActionPerformer, TSetLatestConfig } from '../interfaces'
import {
  printResults,
  printResultsJson,
} from '../utils'
import { parseResults } from '../utils/batch'

export const performSetLatest: TActionPerformer = async (
  config: TSetLatestConfig,
  batchClient
): Promise<void> => {
  const data = await batchClient.setLatestTag(config.data, config.batch?.skipErrors, config.batch?.serial)

  const { successful, failed } = parseResults<TSetLatestTagOpts, TSetLatestTagResult>(
    config.data, data, res => res.value !== undefined
  )
  const successfulPackages = successful.map(item => item.opts)
  const failedPackages = failed.map(item => ({ ...item.opts, reason: item.reason }))

  if (config.batch?.jsonOutput) {
    printResultsJson({
      successfulPackages: config.batch?.printOnlyFailed ? undefined : successfulPackages,
      failedPackages
    })
    return
  }

  printResults(
    config.batch?.printOnlyFailed ? [] : successfulPackages,
    failedPackages,
    ['name', 'version'],
    ['name', 'version', 'reason'],
    'Updated:',
    'Failed:',
  )
}
