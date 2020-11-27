// @ts-ignore
import RegClient from 'npm-registry-client'

import { IDeprecatePackageParams, INpmRegClientWrapper, IPackageParams,TNpmRegClientAuth } from './interfaces'

export class NpmRegClientWrapper implements INpmRegClientWrapper {
  client: RegClient
  auth: TNpmRegClientAuth
  registryUrl: string

  constructor(
    registryUrl: string,
    auth: TNpmRegClientAuth,
    client?: RegClient
  ) {
    this.registryUrl = registryUrl.endsWith('/') ? registryUrl : registryUrl + '/'
    this.auth = auth
    this.client = client || new RegClient()
  }

  deprecate(packageName: string, version: string, message: string): Promise<any> {
    return new Promise<any>(
      (resolve, reject) => {
        try {
          this.client.deprecate(
            this.getPackageUrl(packageName),
            {
              version,
              message,
              auth: this.auth
            },
            resolve
          )
        } catch (e) {
          reject(e)
        }
      }
    )
  }

  deprecateBatch(
    params: Array<IDeprecatePackageParams>,
    skipErrors?: boolean
  ): Promise<any> {
    return NpmRegClientWrapper.performBatchActions(
      params,
      ({ packageName, version, message }) => this.deprecate(packageName, version, message),
      skipErrors
    )
  }

  unDeprecateBatch(
    params: Array<IPackageParams>,
    skipErrors?: boolean
  ): Promise<any[]> {
    return this.deprecateBatch(params.map(item => ({ ...item, message: '' })), skipErrors)
  }

  unDeprecate(packageName: string, version: string): Promise<any> {
    return this.deprecate(packageName, version, '')
  }

  getPackageUrl(packageName: string): string {
    return `${this.registryUrl}${packageName.replace('/', '%2F')}`
  }

  static performBatchActions(
    params: Array<any>,
    actionFactory: (...args: any[]) => Promise<any>,
    skipErrors?: boolean
  ): Promise<any> {
    const actions = params.map(actionFactory)
    if (skipErrors) {
      return Promise.allSettled(actions)
    }
    return Promise.all(actions)
  }
}

export { RegClient }
