import { Packument } from '@qiwi/npm-types'

export interface IPackageParams {
  packageName: string
  version: string
}

export interface IDeprecatePackageParams extends IPackageParams {
  message: string
}

export type TPackageAccess = 'public' | 'restricted'

export type TTarballOpts = {
  name: string
  version: string
  filePath: string
  access: TPackageAccess
}

export type TSetLatestTagOpts = {
  name: string
  version?: string
}

export type TNpmRegistryClientResult = {
  success: boolean
  error?: string
} | null

export type TBatchResult<T> = PromiseSettledResult<T>

export type TDeprecateResult = TNpmRegistryClientResult

export type TPublishResult = TNpmRegistryClientResult

export type TGetPackumentResult = TNpmRegistryClientResult | Packument

export type TSetLatestTagResult = TNpmRegistryClientResult

export interface INpmRegClientBatchWrapper {
  getPackument(
    params: Array<string>,
    skipErrors?: boolean
  ): Promise<TBatchResult<TGetPackumentResult>[]>

  deprecate(
    params: Array<IDeprecatePackageParams>,
    skipErrors?: boolean
  ): Promise<TBatchResult<TDeprecateResult>[]>

  unDeprecate(
    params: Array<IPackageParams>,
    skipErrors?: boolean
  ): Promise<TBatchResult<TDeprecateResult>[]>

  publish(
    opts: TTarballOpts[],
    skipErrors?: boolean
  ): Promise<TBatchResult<TPublishResult>[]>

  setLatestTag(
    opts: TSetLatestTagOpts[],
    skipErrors?: boolean
  ): Promise<TBatchResult<TSetLatestTagResult>[]>
}

export interface INpmRegClientWrapper {
  deprecate(
    packageName: string,
    version: string,
    message: string
  ): Promise<TDeprecateResult>

  unDeprecate(
    packageName: string,
    version: string,
  ): Promise<TDeprecateResult>

  getPackument(
    packageName: string
  ): Promise<Packument>

  publish(
    opts: TTarballOpts
  ): Promise<TPublishResult>

  setLatestTag(
    opts: TSetLatestTagOpts
  ): Promise<TSetLatestTagResult>

  getVersions(
    name: string
  ): Promise<string[]>
}

export type TNpmRegClientAuth = {
  username: string,
  password: string,
  email: string,
  alwaysAuth?: boolean
} | {
  token: string,
  alwaysAuth?: boolean
}

export {
  Packument
}
