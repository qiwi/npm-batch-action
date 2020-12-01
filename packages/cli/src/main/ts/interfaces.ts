import { IDeprecatePackageParams, TNpmRegClientAuth } from '@qiwi/npm-batch-client'
import { IComplexDelay } from 'push-it-to-the-limit'

export type TNpmAction = 'deprecate' | 'un-deprecate'

export type TRateLimit = IComplexDelay | IComplexDelay[]

export interface IBaseConfig<T = any> {
  registryUrl: string
  auth: TNpmRegClientAuth
  action: TNpmAction
  batch?: {
    ratelimit?: TRateLimit,
    skipErrors?: boolean,
  }
  data: T,
}

export type TDeprecationConfig = IBaseConfig<Array<IDeprecatePackageParams>>

export interface ICliArgs {
  config: string
}
