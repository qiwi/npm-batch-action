import {
  IDeprecatePackageParams,
  INpmRegClientBatchWrapper,
  TNpmRegClientAuth,
  TSetLatestTagOpts,
  TTarballOpts
} from '@qiwi/npm-batch-client'
import { IComplexDelay } from 'push-it-to-the-limit'

export type TNpmAction = 'deprecate' | 'un-deprecate' | 'publish' | 'get' | 'set-latest'

export type TRateLimit = IComplexDelay | IComplexDelay[]

export interface IBaseConfig<T = any> {
  registryUrl: string
  auth: TNpmRegClientAuth
  action: TNpmAction
  batch?: {
    ratelimit?: TRateLimit,
    skipErrors?: boolean,
    jsonOutput?: boolean,
    path?: string,
    printOnlyFailed?: boolean,
  },
  data: T,
}

export type TPublishConfig = IBaseConfig<Array<TTarballOpts>>

export type TDeprecationConfig = IBaseConfig<Array<IDeprecatePackageParams>>

export type TGetConfig = IBaseConfig<string[]>

export type TSetLatestConfig = IBaseConfig<TSetLatestTagOpts[]>

export type TActionPerformer = (config: IBaseConfig, helper: INpmRegClientBatchWrapper) => Promise<void>

export interface ICliArgs {
  config: string
}
