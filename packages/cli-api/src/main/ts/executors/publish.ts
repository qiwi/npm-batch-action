import {
  TPublishResult,
  TTarballOpts
} from '@qiwi/npm-batch-client'

import { TActionPerformer, TPublishConfig } from '../interfaces'
import { printResults, printResultsJson } from '../utils'
import { parseResults } from '../utils/batch'

export const performPublish: TActionPerformer = async (
  config: TPublishConfig,
  batchClient
): Promise<void> => {
  const data = await batchClient.publish(config.data, config.batch?.skipErrors)

  const { successful, failed } = parseResults<TTarballOpts, TPublishResult>(config.data, data)
  const successfulPackages = successful.map(item => item.opts)
  const failedPackages = failed.map(item => ({ ...item.opts, reason: item.reason }))

  if (config.batch?.jsonOutput) {
    printResultsJson({
      successfulPackages: config.batch?.printOnlyFailed ? undefined : successfulPackages,
      failedPackages,
    })
    return
  }

  printResults(
    config.batch?.printOnlyFailed ? [] : successfulPackages,
    failedPackages,
    ['name', 'version', 'filePath', 'access'],
    ['name', 'version', 'filePath', 'access', 'error'],
    'Following packages are published successfully:',
    'Following packages are not published due to errors:',
  )
}
