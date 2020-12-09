import nock from 'nock'

import {
  getFailedResults,
  handleSettledResults,
  performDeprecation,
  printResults,
  processResults,
  TDeprecationConfig
} from '../../../main/ts'
import * as deprecation from '../../../main/ts/executors/deprecation'
import { mockOutput } from '../utils'

const registryUrl = 'http://localhost'
const config: TDeprecationConfig = {
  registryUrl,
  auth: {
    username: 'username',
    password: 'password',
  },
  batch: {
    ratelimit: {
      period: 500,
      count: 2
    }
  },
  action: 'deprecate',
  data: [
    {
      packageName: 'foo',
      version: '<1.2.0',
      message: 'foo is deprecated',
    },
    {
      packageName: 'bar',
      version: '<1.3.0',
      message: 'bar is deprecated',
    },
    {
      packageName: 'baz',
      version: '<1.4.0',
      message: 'baz is deprecated',
    },
    {
      packageName: 'bat',
      version: '<1.5.0',
      message: 'bat is deprecated',
    },
  ]
}

const createMocks = () =>
  config.data.map(data => ({
    info: nock(registryUrl)
      .get(`/${data.packageName}?write=true`)
      .reply(200, { versions: { '0.1.0': {} } }),
    deprecate: nock(registryUrl)
      .put(`/${data.packageName}`)
      .reply(200)
  }))

describe('performDeprecation', () => {
  beforeEach(() => jest.restoreAllMocks())

  it('makes API requests with rate limit', async () => {
    mockOutput()
    const mocks = createMocks()
    const startTime = Date.now()
    await performDeprecation(config)
    const endTime = Date.now() - startTime
    expect(mocks.filter(item => item.info.isDone() && item.deprecate.isDone()))
      .toHaveLength(mocks.length)
    expect(endTime).toBeGreaterThanOrEqual(500)
  })
})

describe('processResults', () => {
  it('calls necessary util functions', () => {
    mockOutput()
    const getSuccessfulResults = jest.spyOn(deprecation, 'getSuccessfulResults')
    const getFailedResults = jest.spyOn(deprecation, 'getFailedResults')

    processResults([], config)

    expect(getSuccessfulResults).toHaveBeenCalled()
    expect(getFailedResults).toHaveBeenCalled()
  })

  it('normalizes settled results', () => {
    mockOutput()
    const handleSettledResultsSpy = jest.spyOn(deprecation, 'handleSettledResults')

    // eslint-disable-next-line unicorn/no-null
    processResults([{ status: 'fulfilled', value: null }, { status: 'fulfilled', value: null }], {
      ...config,
      batch: {
        ...config.batch,
        skipErrors: true
      }
    })

    expect(handleSettledResultsSpy).toHaveBeenCalled()
  })
})

describe('printResults', function () {
  it('prints successful results only when they are presented', () => {
    const consoleMock = {
      log: jest.fn(),
      table: jest.fn(),
      error: jest.fn()
    }

    const failedPackages: any[] = []
    printResults(config.data, failedPackages, false, consoleMock as any)
    expect(consoleMock.log).toHaveBeenCalledWith(expect.stringContaining('success'))
    expect(consoleMock.table).toHaveBeenCalledWith(config.data, expect.any(Array))
    expect(consoleMock.error).not.toHaveBeenCalledWith(expect.stringContaining('errors'))
    expect(consoleMock.table).not.toHaveBeenCalledWith(failedPackages, expect.any(Array))
  })

  it('does not print successful results when they are not presented', () => {
    const consoleMock = {
      log: jest.fn(),
      table: jest.fn(),
      error: jest.fn()
    }

    const successfulPackages: any[] = []
    const failedPackages = config.data.map(item => ({ ...item, error: 'error' }))
    printResults(successfulPackages, failedPackages, false, consoleMock as any)
    expect(consoleMock.log).not.toHaveBeenCalledWith(expect.stringContaining('success'))
    expect(consoleMock.table).not.toHaveBeenCalledWith(successfulPackages, expect.any(Array))
    expect(consoleMock.error).toHaveBeenCalledWith(expect.stringContaining('errors'))
    expect(consoleMock.table).toHaveBeenCalledWith(failedPackages, expect.any(Array))
  })

  it('prints results in JSON when appropriate flag is presented', () => {
    const consoleMock = {
      log: jest.fn(),
      table: jest.fn(),
      error: jest.fn()
    }
    const successfulPackages: any[] = []
    const failedPackages: any[] = []
    printResults(successfulPackages, failedPackages, true, consoleMock as any)
    expect(consoleMock.log).toHaveBeenCalledWith(JSON.stringify(
      { successfulPackages, failedPackages },
      null, // eslint-disable-line unicorn/no-null
      '\t'
    ))

    expect(consoleMock.error).not.toHaveBeenCalled()
    expect(consoleMock.table).not.toHaveBeenCalled()
  })
})

describe('utils', () => {
  test('getFailedResults handles different types of error', () => {
    const data = getFailedResults(
      config.data.map(
        (packageInfo, i) => ({
          packageInfo,
          result: i % 2 === 0 ? 'error' : new Error('error')
        }))
    )
    expect(data).toEqual(config.data.map(item => ({ ...item, error: 'error' })))
  })

  test('handleSettledResults normalizes fulfilled and rejected results', () => {
    expect(handleSettledResults([
      { status: 'fulfilled', value: 'value' },
      { status: 'rejected', reason: 'reason' },
    ])).toEqual([
      'value',
      'reason'
    ])
  })
});
