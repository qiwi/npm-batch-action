import RegClient from '@qiwi/npm-registry-client'
import { Packument } from '@qiwi/npm-types'
import { createReadStream } from 'fs'
import { rcompare } from 'semver'

import {
  INpmRegClientWrapper,
  TDeprecateResult,
  TNpmRegClientAuth,
  TPublishResult,
  TSetLatestTagOpts,
  TSetLatestTagResult,
  TTarballOpts,
} from './interfaces'

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

  deprecate(packageName: string, version: string, message: string): Promise<TDeprecateResult> {
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
            NpmRegClientWrapper.callbackFactory(resolve, reject, data => data.success)
          )
        } catch (e) {
          reject(e)
        }
      }
    )
  }

  unDeprecate(packageName: string, version: string): Promise<TDeprecateResult> {
    return this.deprecate(packageName, version, '')
  }

  getPackageUrl(packageName: string): string {
    return `${this.registryUrl}${packageName.replace('/', '%2F')}`
  }

  getPackument(packageName: string): Promise<Packument> {
    return new Promise(
      (resolve, reject) => {
        const callback = NpmRegClientWrapper.callbackFactory(resolve, reject, data => data.success !== false)
        try {
          this.client.get(
            this.getPackageUrl(packageName),
            { auth: this.auth },
            callback
          )
        } catch (e) {
          callback(e)
        }
      }
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

  async setLatestTag(opt: TSetLatestTagOpts): Promise<TSetLatestTagResult> {
    const version = opt.version ? opt.version : await this.getVersions(opt.name)
      .then(versions => versions.sort(rcompare)[0])

    return new Promise(
      (resolve, reject) => {
        try {
          this.client.distTags.add(
            this.registryUrl,
            {
              version: version,
              package: opt.name,
              distTag: 'latest',
              auth: this.auth
            },
            NpmRegClientWrapper.callbackFactory(resolve, reject, data => data.success)
          )
        } catch (e) {
          reject(e)
        }
      }
    )
  }

  async getVersions(name: string): Promise<string[]> {
    const packuments = await this.getPackument(name)
    if (!packuments?.versions) {
      throw new Error(`Versions are absent for ${name}`)
    }
    return Object.keys(packuments.versions)
  }

  static callbackFactory(
    resolve: (...args: any[]) => void,
    reject: (...args: any[]) => void,
    isValid?: (data: any) => boolean
  ) {
    return (
      err: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
      data?: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    ): void => {
      if (err) {
        reject(err)
        return
      }
      if (data && isValid && !isValid(data)) {
        reject(data)
        return
      }
      resolve(data)
    }
  }
}

export { RegClient }
