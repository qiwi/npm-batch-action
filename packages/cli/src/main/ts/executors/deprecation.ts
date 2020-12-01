import { NpmRegClientWrapper, RegClient } from '@qiwi/npm-batch-client'

import { defaultRateLimit } from '../default'
import { TDeprecationConfig } from '../interfaces'
import { withRateLimit } from '../utils'

export const performDeprecation = async (config: TDeprecationConfig): Promise<any[]> => {
  const regClient = new RegClient()
  const batchClient = new NpmRegClientWrapper(
    config.registryUrl,
    config.auth,
    withRateLimit<RegClient>(regClient, config.batch?.ratelimit || defaultRateLimit, ['deprecate'])
  )
  return batchClient.unDeprecateBatch(config.data, config.batch?.skipErrors)
}
