import { performDeprecation } from './executors'
import { ICliArgs } from './interfaces'
import { readFileToString, validateBaseConfig, validateDeprecationConfig } from './utils'

export const run = (args: ICliArgs): Promise<void> => {
  const rawConfig = JSON.parse(readFileToString(args.config))
  const validatedConfig = validateBaseConfig(rawConfig)
  switch (validatedConfig.action) {
    case 'deprecate':
    case 'un-deprecate': {
      const deprecationConfig = validateDeprecationConfig(validatedConfig)
      return performDeprecation(deprecationConfig)
    }
    default:
      throw new Error(`Action ${validatedConfig.action} is not supported`)
  }
}

