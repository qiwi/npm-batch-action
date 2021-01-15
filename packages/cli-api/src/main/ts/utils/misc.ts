import assert from 'assert'
import { readFileSync } from 'fs'
import { IBaseConfig } from '../interfaces'
import { NpmRegClientWrapper, RegClient } from '@qiwi/npm-batch-client'
import { withRateLimit } from './withRateLimit'
import { defaultRateLimit } from '../default'

export const readFileToString = (path: string): string => readFileSync(path).toString()

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const assertString = (value: any, name: string): void => {
  assert.ok(typeof value === 'string', `${name} should be a string`)
}

export const printResultsJson = (
  successfulPackages: Array<any>,
  failedPackages: Array<any>,
  logger = console
): void => {
  logger.log(
    JSON.stringify(
      {
        successfulPackages,
        failedPackages
      },
      null, // eslint-disable-line unicorn/no-null
      '\t'
    )
  )
}

export const printResults = (
  successfulPackages: Array<any>,
  failedPackages: Array<any>,
  successfulPackagesFields: string[],
  failedPackagesFields: string[],
  successfulCaption: string,
  failedCaption: string,
  logger = console
): void => {
  if (successfulPackages.length > 0) {
    logger.log(successfulCaption)
    logger.table(successfulPackages, successfulPackagesFields)
  }

  if (failedPackages.length > 0) {
    logger.error(failedCaption)
    logger.table(failedPackages, failedPackagesFields)
  }
}

export const npmRegClientWrapperFactory = (
  config: IBaseConfig,
  limitedMethods: string[],
  regClient: RegClient
) => new NpmRegClientWrapper(
  config.registryUrl,
  config.auth,
  withRateLimit<RegClient>(regClient, config.batch?.ratelimit || defaultRateLimit, limitedMethods)
)
