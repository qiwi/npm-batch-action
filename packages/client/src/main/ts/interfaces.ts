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

export interface INpmRegClientWrapper {
  deprecate(
    packageName: string,
    version: string,
    message: string
  ): Promise<any>

  unDeprecate(
    packageName: string,
    version: string,
  ): Promise<any>

  deprecateBatch(
    params: Array<IDeprecatePackageParams>,
    skipErrors?: boolean
  ): Promise<any[]>

  unDeprecateBatch(
    params: Array<IPackageParams>,
    skipErrors?: boolean
  ): Promise<any[]>

  get(
    packageName: string
  ): Promise<Packument>

  getBatch(
    packageNames: string[],
    skipErrors?: boolean
  ): Promise<Packument[]>

  publish(
    opts: TTarballOpts
  ): Promise<any>

  publishBatch(
    opts: TTarballOpts[]
  ): Promise<any>
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
