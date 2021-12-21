import {
  IDeprecatePackageParams,
  INpmRegClientBatchWrapper,
  INpmRegClientWrapper,
  IPackageParams,
  TBatchResult,
  TDeprecateResult,
  TGetPackumentResult,
  TPublishResult,
  TSetLatestTagOpts,
  TSetLatestTagResult,
  TTarballOpts
} from './interfaces'

export class NpmRegClientBatchWrapper implements INpmRegClientBatchWrapper {
  constructor(private npmClient: INpmRegClientWrapper) {}

  getPackument(
    packageNames: string[],
    skipErrors?: boolean,
    serial?: boolean,
  ): Promise<TBatchResult<TGetPackumentResult>[]> {
    return NpmRegClientBatchWrapper.performBatchActions(
      packageNames,
      (packageName) => this.npmClient.getPackument(packageName),
      skipErrors,
      serial,
    )
  }

  deprecate(
    params: Array<IDeprecatePackageParams>,
    skipErrors?: boolean,
    serial?: boolean,
): Promise<TBatchResult<TDeprecateResult>[]> {
    return NpmRegClientBatchWrapper.performBatchActions(
      params,
      ({ packageName, version, message }) => this.npmClient.deprecate(packageName, version, message),
      skipErrors,
      serial,
    )
  }

  unDeprecate(
    params: Array<IPackageParams>,
    skipErrors?: boolean,
    serial?: boolean,
  ): Promise<TBatchResult<TDeprecateResult>[]> {
    return this.deprecate(params.map(item => ({ ...item, message: '' })), skipErrors, serial)
  }

  publish(
    opts: TTarballOpts[],
    skipErrors?: boolean,
    serial?: boolean,
  ): Promise<TBatchResult<TPublishResult>[]> {
    return NpmRegClientBatchWrapper.performBatchActions(
      opts,
      (opt) => this.npmClient.publish(opt),
      skipErrors,
      serial,
    )
  }

  setLatestTag(
    opts: TSetLatestTagOpts[],
    skipErrors?: boolean,
    serial?: boolean,
  ): Promise<TBatchResult<TSetLatestTagResult>[]> {
    return NpmRegClientBatchWrapper.performBatchActions<TSetLatestTagResult>(
      opts,
      (opt) => this.npmClient.setLatestTag(opt),
      skipErrors,
      serial,
    )
  }

  static async performSerialBatchActions<T>(
    params: Array<any>,
    actionFactory: (...args: any[]) => Promise<T>,
    skipErrors?: boolean,
  ): Promise<TBatchResult<T>[]> {
    const results: TBatchResult<T>[] = []

    for (const opts of params) {
      try {
        results.push({
          status: 'fulfilled',
          value: await actionFactory(opts),
        })
      } catch (e) {
        if (!skipErrors) {
          throw e
        }

        results.push({
          status: 'rejected',
          reason: e
        })
      }
    }

    return results
  }

  static performBatchActions<T>(
    params: Array<any>,
    actionFactory: (...args: any[]) => Promise<T>,
    skipErrors?: boolean,
    serial?: boolean
  ): Promise<TBatchResult<T>[]> {
    if (serial) {
      return NpmRegClientBatchWrapper.performSerialBatchActions(params, actionFactory, skipErrors)
    }

    const actions = params.map(actionFactory)
    if (skipErrors) {
      return Promise.allSettled(actions)
    }
    return Promise.all(actions)
      .then(results => results.map(value => ({ status: 'fulfilled', value })))
  }
}
