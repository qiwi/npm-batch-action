import { IDeprecatePackageParams, TNpmRegClientAuth, TTarballOpts } from '@qiwi/npm-batch-client'
import { IComplexDelay } from 'push-it-to-the-limit'

export type TNpmAction = 'deprecate' | 'un-deprecate' | 'publish' | 'get'

export type TRateLimit = IComplexDelay | IComplexDelay[]

export interface IBaseConfig<T = any> {
  registryUrl: string
  auth: TNpmRegClientAuth
  action: TNpmAction
  batch?: {
    ratelimit?: TRateLimit,
    skipErrors?: boolean,
    jsonOutput?: boolean,
    path?: string
  },
  data: T,
}

export type TPublishConfig = IBaseConfig<Array<TTarballOpts>>

export type TDeprecationConfig = IBaseConfig<Array<IDeprecatePackageParams>>

export type TGetConfig = IBaseConfig<string[]>

export interface ICliArgs {
  config: string
}