import RegClient from '@qiwi/npm-registry-client'

import { performDeprecation, performGet,performPublish } from './executors'
import { performSetLatest } from './executors/setLatest'
import { ICliArgs } from './interfaces'
import {
  npmRegClientBatchWrapperFactory,
  npmRegClientWrapperFactory,
  readFileToString,
  validateBaseConfig,
  validateDeprecationConfig,
  validateGetConfig,
  validatePublishConfig,
  validateSetLatestConfig
} from './utils'

export const run = (configString: string): Promise<void> => {
  const rawConfig = JSON.parse(configString)
  const validatedConfig = validateBaseConfig(rawConfig)
  const wrapper = npmRegClientWrapperFactory(
    validatedConfig,
    ['publish', 'get', 'distTags.add'],
    new RegClient({ defaultTag: 'latest-npm-batch-published' })
  )
  const batchWrapper = npmRegClientBatchWrapperFactory(wrapper)
  switch (validatedConfig.action) {
    case 'deprecate':
    case 'un-deprecate': {
      const deprecationConfig = validateDeprecationConfig(validatedConfig)
      return performDeprecation(deprecationConfig, batchWrapper)
    }
    case 'publish': {
      const publishConfig = validatePublishConfig(validatedConfig)
      return performPublish(publishConfig, batchWrapper)
    }
    case 'get': {
      const getConfig = validateGetConfig(validatedConfig)
      return performGet(getConfig, batchWrapper)
    }
    case 'set-latest': {
      const setLatestConfig = validateSetLatestConfig(validatedConfig)
      return performSetLatest(setLatestConfig, batchWrapper)
    }
    default:
      throw new Error(`Action ${validatedConfig.action} is not supported`)
  }
}

export const readConfigAndRun = (args: ICliArgs): Promise<void> => {
  const config = readFileToString(args.config)
  return run(config)
}
