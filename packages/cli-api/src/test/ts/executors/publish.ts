import { TBatchResult, TPublishResult } from '@qiwi/npm-batch-client'

import { performPublish, processPublishResults } from '../../../main/ts/executors/publish'
import { TPublishConfig } from '../../../main/ts/interfaces'
import * as misc from '../../../main/ts/utils/misc'

const registryUrl = 'http://localhost'

const config: TPublishConfig = {
  registryUrl,
  auth: {
    username: 'username',
    password: 'password',
    email: 'email@email.email'
  },
  batch: {
    jsonOutput: true
  },
  action: 'publish',
  data: []
}

beforeEach(jest.restoreAllMocks)

describe('performPublish', () => {
  it('calls publishBatch', async () => {
    const npmClientMock = {
      publishBatch: jest.fn(() => Promise.resolve([]))
    }
    const printResultsJsonSpy = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */ })

    await performPublish(config, npmClientMock as any)

    expect(npmClientMock.publishBatch).toHaveBeenCalledWith(config.data)
    expect(printResultsJsonSpy).toHaveBeenCalledWith([], [])
  })
})

describe('processPublishResults', () => {
  it('prints processed results', () => {
    const nonEmptyConfig: TPublishConfig = {
      ...config,
      data: [
        {
          name: 'foo',
          version: '1.0.0',
          filePath: 'foo.tar.gz',
          access: 'public'
        },
        {
          name: 'bar',
          version: '1.0.0',
          filePath: 'bar.tar.gz',
          access: 'public'
        },
        {
          name: 'baz',
          version: '1.0.0',
          filePath: 'bar.tar.gz',
          access: 'public'
        }
      ]
    }
    const results: TBatchResult<TPublishResult>[] = [
      {
        status: 'fulfilled',
        value: {
          success: true
        }
      },
      {
        status: 'fulfilled',
        value: {
          success: false
        }
      },
      {
        status: 'rejected',
        reason: 'foo'
      }
    ]
    const printResultsJsonSpy = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */ })

    processPublishResults(results, nonEmptyConfig)

    expect(printResultsJsonSpy).toHaveBeenCalledWith(
      [nonEmptyConfig.data[0]],
      [
        {
          ...nonEmptyConfig.data[1],
          error: 'no data',
        },
        {
          ...nonEmptyConfig.data[2],
          error: 'foo'
        }
      ]
    )
  })

  it('calls printResults when jsonOutput flag is not set', () => {
    const printResultsSpy = jest.spyOn(misc, 'printResults')
      .mockImplementation(() => { /* noop */ })

    processPublishResults([], { ...config, batch: undefined })

    expect(printResultsSpy).toHaveBeenCalled()
  })
})
