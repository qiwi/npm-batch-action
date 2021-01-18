import nock from 'nock'

import {
  getFailedResults,
  handleSettledResults,
  performDeprecation,
  processResults,
  TDeprecationConfig
} from '../../../main/ts'
import * as deprecation from '../../../main/ts/executors/deprecate'
import * as misc from '../../../main/ts/utils/misc'
import { mockOutput } from '../utils'

const registryUrl = 'http://localhost'
const config: TDeprecationConfig = {
  registryUrl,
  auth: {
    username: 'username',
    password: 'password',
    email: 'email@email.email'
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

  it('prints output in JSON when flag is true', async () => {
    const npmClientMock = {
      deprecateBatch: jest.fn(() => Promise.resolve([]))
    }

    const printResultsJsonSpy = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */ })

    await performDeprecation({ ...config, batch: { jsonOutput: true }}, npmClientMock as any)

    expect(printResultsJsonSpy).toHaveBeenCalledWith({
      successfulResults: [],
      failedResults: []
    })
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
      { status: 'fulfilled', value: null }, // eslint-disable-line unicorn/no-null
      { status: 'rejected', reason: 'reason' },
    ])).toEqual([
      null, // eslint-disable-line unicorn/no-null
      'reason'
    ])
  })
});
