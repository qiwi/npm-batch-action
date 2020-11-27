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
