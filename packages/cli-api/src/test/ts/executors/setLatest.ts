import { TPublishConfig } from '@qiwi/npm-batch-cli-api'

import { performSetLatest,TSetLatestConfig } from '../../../main/ts'
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
  action: 'set-latest',
  data: []
}

describe('performSettingLatest', () => {
  it('calls setLatest', async () => {
    const npmClientMock = {
      setLatestTag: jest.fn(() => Promise.resolve([]))
    }
    const printResultsJsonSpy = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */ })

    await performSetLatest(config, npmClientMock as any)

    expect(npmClientMock.setLatestTag).toHaveBeenCalledWith(config.data, undefined, undefined)
    expect(printResultsJsonSpy).toHaveBeenCalledWith({ successfulPackages: [], failedPackages: [] })
  })

  it('prints processed results', async () => {
    const nonEmptyConfig: TSetLatestConfig = {
      ...config,
      data: [
        {
          name: 'foo',
          version: '1.0.0',
        },
        {
          name: 'bar',
          version: '1.0.0',
        },
        {
          name: 'baz',
          version: '1.0.0',
        }
      ]
    }
    const results: any[] = [
      {
        status: 'fulfilled',
        value: undefined
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
      setLatestTag: jest.fn(() => Promise.resolve(results))
    }

    await performSetLatest(nonEmptyConfig, npmClientMock as any)

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
      setLatestTag: jest.fn(() => Promise.resolve([]))
    }

    await performSetLatest({ ...config, batch: undefined }, npmClientMock as any)

    expect(printResultsSpy).toHaveBeenCalled()
  })
})
