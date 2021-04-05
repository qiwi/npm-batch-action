import { performGet, TGetConfig } from '../../../main/ts'
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
      getPackument: jest.fn(() => Promise.resolve([]))
    }
    const printResultsJsonSpy = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */
      })

    await performGet(config, npmClientMock as any)

    expect(npmClientMock.getPackument).toHaveBeenCalledWith(config.data, true)
    expect(printResultsJsonSpy).toHaveBeenCalledWith({
      failedPackages: [],
      successfulPackages: [],
      packuments: []
    })
  })

  it('handles errors', async () => {
    const error =  new Error('error')
    const npmClientMock = {
      getPackument: jest.fn(() => Promise.resolve([
        {
          status: 'fulfilled',
          value: { foo: 'foo' } as any,
        },
        {
          status: 'fulfilled',
          value: {
            success: false,
            error: 'error',
          }
        },
        {
          status: 'rejected',
          reason: 'error',
        },
        {
          status: 'rejected',
          reason: error,
        },
        {
          status: 'rejected',
          reason: undefined,
        }
      ]))
    }

    const printResultsSpy = jest.spyOn(misc, 'printResults')
      .mockImplementation(() => { /* noop */
      })
    const writeToFileSpy = jest.spyOn(misc, 'writeToFile')
      .mockImplementation(() => { /* noop */ })

    await performGet({
      ...config,
      batch: undefined,
      data: [
        'foo',
        'bar',
        'baz',
        'bat',
        'qux'
      ]
    }, npmClientMock as any)


    expect(printResultsSpy).toHaveBeenCalledWith(
      [
        {
          name: 'foo',
        }
      ],
      [
        {
          name: 'bar',
          reason: 'error',
        },
        {
          name: 'baz',
          reason: 'error',
        },
        {
          name: 'bat',
          reason: error.message,
        },
        {
          name: 'qux',
          reason: 'no data',
        }
      ],
      expect.any(Array),
      expect.any(Array),
      expect.any(String),
      expect.any(String),
    )
    expect(writeToFileSpy).toHaveBeenCalled()
  })
})
