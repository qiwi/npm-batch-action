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
    skipErrors?: boolean
  ): Promise<TBatchResult<TGetPackumentResult>[]> {
    return NpmRegClientBatchWrapper.performBatchActions(
      packageNames,
      (packageName) => this.npmClient.getPackument(packageName),
      skipErrors
    )
  }

  deprecate(
    params: Array<IDeprecatePackageParams>,
    skipErrors?: boolean
  ): Promise<TBatchResult<TDeprecateResult>[]> {
    return NpmRegClientBatchWrapper.performBatchActions(
      params,
      ({ packageName, version, message }) => this.npmClient.deprecate(packageName, version, message),
      skipErrors
    )
  }

  unDeprecate(
    params: Array<IPackageParams>,
    skipErrors?: boolean
  ): Promise<TBatchResult<TDeprecateResult>[]> {
    return this.deprecate(params.map(item => ({ ...item, message: '' })), skipErrors)
  }

  publish(
    opts: TTarballOpts[],
    skipErrors?: boolean
  ): Promise<TBatchResult<TPublishResult>[]> {
    return NpmRegClientBatchWrapper.performBatchActions(
      opts,
      (opt) => this.npmClient.publish(opt),
      skipErrors
    )
  }

  setLatestTag(
    opts: TSetLatestTagOpts[],
    skipErrors?: boolean
  ): Promise<TBatchResult<TSetLatestTagResult>[]> {
    return NpmRegClientBatchWrapper.performBatchActions<TSetLatestTagResult>(
      opts,
      (opt) => this.npmClient.setLatestTag(opt),
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
}
