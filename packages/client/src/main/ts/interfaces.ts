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

export type TPublishResult = {
  success: boolean
}

export type TBatchResult<T> = PromiseSettledResult<T>

export interface INpmRegClientWrapper {
  deprecate(
    packageName: string,
    version: string,
    message: string
  ): Promise<null>

  unDeprecate(
    packageName: string,
    version: string,
  ): Promise<null>

  deprecateBatch(
    params: Array<IDeprecatePackageParams>,
    skipErrors?: boolean
  ): Promise<TBatchResult<null>[]>

  unDeprecateBatch(
    params: Array<IPackageParams>,
    skipErrors?: boolean
  ): Promise<TBatchResult<null>[]>

  get(
    packageName: string
  ): Promise<Packument>

  getBatch(
    packageNames: string[],
    skipErrors?: boolean
  ): Promise<TBatchResult<Packument>[]>

  publish(
    opts: TTarballOpts
  ): Promise<TPublishResult>

  publishBatch(
    opts: TTarballOpts[],
    skipErrors?: boolean
  ): Promise<TBatchResult<TPublishResult>[]>
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
