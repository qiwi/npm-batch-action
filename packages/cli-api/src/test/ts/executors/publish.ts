import { TBatchResult, TPublishResult } from '@qiwi/npm-batch-client'

import { performPublish, TPublishConfig } from '../../../main/ts'
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
  it('calls publish', async () => {
    const npmClientMock = {
      publish: jest.fn(() => Promise.resolve([]))
    }
    const printResultsJsonSpy = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */ })

    await performPublish(config, npmClientMock as any)

    expect(npmClientMock.publish).toHaveBeenCalledWith(config.data, undefined, undefined)
    expect(printResultsJsonSpy).toHaveBeenCalledWith({ successfulPackages: [], failedPackages: [] })
  })

  it('prints processed results', async () => {
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
    const npmClientMock = {
      publish: jest.fn(() => Promise.resolve(results))
    }

    await performPublish(nonEmptyConfig, npmClientMock as any)

    expect(printResultsJsonSpy).toHaveBeenCalledWith({
      successfulPackages: [nonEmptyConfig.data[0]],
      failedPackages: [
        {
          ...nonEmptyConfig.data[1],
          reason: 'no data',
        },
        {
          ...nonEmptyConfig.data[2],
          reason: 'foo'
        }
      ]
    })
  })

  it('calls printResults when jsonOutput flag is not set', async () => {
    const printResultsSpy = jest.spyOn(misc, 'printResults')
      .mockImplementation(() => { /* noop */ })

    const npmClientMock = {
      publish: jest.fn(() => Promise.resolve([]))
    }

    await performPublish({ ...config, batch: undefined }, npmClientMock as any)

    expect(printResultsSpy).toHaveBeenCalled()
  })
})
