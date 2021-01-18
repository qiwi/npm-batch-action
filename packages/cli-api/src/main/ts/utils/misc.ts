import { NpmRegClientWrapper, RegClient } from '@qiwi/npm-batch-client'
import assert from 'assert'
import { readFileSync } from 'fs'

import { defaultRateLimit } from '../default'
import { IBaseConfig } from '../interfaces'
import { withRateLimit } from './withRateLimit'

export const readFileToString = (path: string): string => readFileSync(path).toString()

// TODO migrate to blork - needs ts libdefs to be added at first
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const assertString = (value: any, name: string): void => {
  assert.ok(typeof value === 'string', `${name} should be a string`)
}

export const printResultsJson = (
  results: Record<string, any>,
  logger = console
): void => {
  logger.log(
    JSON.stringify(
      results,
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
): NpmRegClientWrapper => new NpmRegClientWrapper(
  config.registryUrl,
  config.auth,
  withRateLimit<RegClient>(regClient, config.batch?.ratelimit || defaultRateLimit, limitedMethods)
)
