import { Packument } from '@npm/types'

export interface IPackageParams {
  packageName: string
  version: string
}

export interface IDeprecatePackageParams extends IPackageParams {
  message: string
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
}

export type TNpmRegClientAuth = {
  username: string,
  password: string,
  email?: string,
  alwaysAuth?: boolean
} | {
  token: string,
  alwaysAuth?: boolean
}
