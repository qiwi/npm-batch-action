import { performDeprecation, performGet,performPublish } from './executors'
import { ICliArgs } from './interfaces'
import {
  readFileToString,
  validateBaseConfig,
  validateDeprecationConfig,
  validateGetConfig,
  validatePublishConfig
} from './utils'

export const run = (configString: string): Promise<void> => {
  const rawConfig = JSON.parse(configString)
  const validatedConfig = validateBaseConfig(rawConfig)
  switch (validatedConfig.action) {
    case 'deprecate':
    case 'un-deprecate': {
      const deprecationConfig = validateDeprecationConfig(validatedConfig)
      return performDeprecation(deprecationConfig)
    }
    case 'publish': {
      const publishConfig = validatePublishConfig(validatedConfig)
      return performPublish(publishConfig)
    }
    case 'get': {
      const getConfig = validateGetConfig(validatedConfig)
      return performGet(getConfig)
    }
    default:
      throw new Error(`Action ${validatedConfig.action} is not supported`)
  }
}

export const readConfigAndRun = (args: ICliArgs): Promise<void> => {
  const config = readFileToString(args.config)
  return run(config)
}
