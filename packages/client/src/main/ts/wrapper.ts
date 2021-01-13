import RegClient from '@qiwi/npm-registry-client'
import { Packument } from '@qiwi/npm-types'
import { createReadStream } from 'fs'

import {
  IDeprecatePackageParams,
  INpmRegClientWrapper,
  IPackageParams,
  TBatchResult,
  TNpmRegClientAuth,
  TPublishResult,
  TTarballOpts} from './interfaces'

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
  ): Promise<TBatchResult<any>[]> {
    return NpmRegClientWrapper.performBatchActions(
      params,
      ({ packageName, version, message }) => this.deprecate(packageName, version, message),
      skipErrors
    )
  }

  unDeprecateBatch(
    params: Array<IPackageParams>,
    skipErrors?: boolean
  ): Promise<TBatchResult<any>[]> {
    return this.deprecateBatch(params.map(item => ({ ...item, message: '' })), skipErrors)
  }

  unDeprecate(packageName: string, version: string): Promise<any> {
    return this.deprecate(packageName, version, '')
  }

  getPackageUrl(packageName: string): string {
    return `${this.registryUrl}${packageName.replace('/', '%2F')}`
  }

  get(packageName: string): Promise<Packument> {
    return new Promise<Packument>(
      (resolve, reject) => {
        try {
          this.client.get(this.getPackageUrl(packageName), {}, (_, data) => resolve(data))
        } catch (e) {
          reject(e)
        }
      }
    )
  }

  getBatch(packageNames: string[], skipErrors?: boolean): Promise<TBatchResult<Packument>[]> {
    return NpmRegClientWrapper.performBatchActions(
      packageNames,
      (packageName) => this.get(packageName),
      skipErrors
    )
  }

  publish({ name, version, filePath, access }: TTarballOpts): Promise<TPublishResult> {
    return new Promise<any>(
      (resolve, reject) => {
        try {
          this.client.publish(
            this.registryUrl,
            {
              metadata: { name, version },
              access,
              body: createReadStream(filePath),
              auth: this.auth
            },
            NpmRegClientWrapper.callbackFactory(resolve, reject)
          )
        } catch (e) {
          reject(e)
        }
      }
    )
  }

  publishBatch(opts: TTarballOpts[], skipErrors?: boolean): Promise<TBatchResult<TPublishResult>[]> {
    return NpmRegClientWrapper.performBatchActions(
      opts,
      (opt) => this.publish(opt),
      skipErrors
    )
  }

  static performBatchActions<T>(
    params: Array<any>,
    actionFactory: (...args: any[]) => Promise<T>,
    skipErrors?: boolean
  ): Promise<TBatchResult<T>[]> {
    const actions = params.map(actionFactory)
    if (skipErrors) {
      return Promise.allSettled(actions)
    }
    return Promise.all(actions)
      .then(results => results.map(value => ({ status: 'fulfilled', value })))
  }

  static callbackFactory(
    resolve: (...args: any[]) => void,
    reject: (...args: any[]) => void,
  ) {
    return (
      err: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
      data: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    ): void => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    }
  }
}

export { RegClient }
