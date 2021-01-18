import { Packument, TBatchResult } from '@qiwi/npm-batch-client'
import fs from 'fs'

import { TGetConfig } from '../../../main/ts'
import { performGet, processGetResults } from '../../../main/ts/executors/get'
import * as misc from '../../../main/ts/utils/misc'

const registryUrl = 'http://localhost'

const config: TGetConfig = {
  registryUrl,
  auth: {
    username: 'username',
    password: 'password',
    email: 'email@email.email'
  },
  batch: {
    jsonOutput: true,
    skipErrors: true
  },
  action: 'get',
  data: []
}

beforeEach(jest.restoreAllMocks)

describe('performGet', () => {
  it('calls getBatch', async () => {
    const npmClientMock = {
      getBatch: jest.fn(() => Promise.resolve([]))
    }
    const printResultsJsonSpy = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */
      })

    await performGet(config, npmClientMock as any)

    expect(npmClientMock.getBatch).toHaveBeenCalledWith(config.data, true)
    expect(printResultsJsonSpy).toHaveBeenCalledWith({
      failedPackages: [],
      successfulPackages: [],
      packuments: []
    })
  })
})

describe('processGetResults', () => {
  const results: TBatchResult<Packument>[] = [
    {
      status: 'fulfilled',
      value: {} as Packument
    },
    {
      status: 'fulfilled',
      value: undefined as any
    },
    {
      status: 'rejected',
      reason: 'error'
    },
    {
      status: 'rejected',
      reason: new Error('error')
    },
    {
      status: 'rejected',
      reason: undefined
    }
  ]

  it('handles results and writes them to a file', () => {
    const customConfig = {
      ...config,
      batch: { path: 'foo' },
      data: ['foo', 'bar', 'baz', 'bat', 'qux']
    }
    const printResults = jest.spyOn(misc, 'printResults')
      .mockImplementation(() => { /* noop */
      })
    const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync')
      .mockImplementation(() => { /* noop */
      })
    const printResultsJsonSpy = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */
      })

    processGetResults(results, customConfig)

    expect(printResultsJsonSpy).not.toHaveBeenCalled()
    expect(writeFileSyncSpy).toHaveBeenCalledWith(
      'foo',
      JSON.stringify(
        [
          { name: 'foo', value: {} }
        ],
        null, // eslint-disable-line unicorn/no-null
        '\t'
      )
    )
    expect(printResults).toHaveBeenCalled()
  })

  it('prints results in json', () => {
    const customConfig = {
      ...config,
      batch: { jsonOutput: true },
      data: ['foo', 'bar', 'baz', 'bat', 'qux']
    }

    const printResults = jest.spyOn(misc, 'printResults')
      .mockImplementation(() => { /* noop */
      })
    const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync')
      .mockImplementation(() => { /* noop */
      })
    const printResultsJsonSpy = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */
      })

    processGetResults(results, customConfig)

    expect(printResults).not.toHaveBeenCalled()
    expect(writeFileSyncSpy).not.toHaveBeenCalled()
    expect(printResultsJsonSpy).toHaveBeenCalledWith({
      successfulPackages: [
        { name: 'foo' },
      ],
      failedPackages: [
        { name: 'bar', error: 'got undefined instead of Packument' },
        { name: 'baz', error: 'error' },
        { name: 'bat', error: 'error' },
        { name: 'qux', error: undefined },
      ],
      packuments: [{ name: 'foo', value: {} }]
    })
  })
})
