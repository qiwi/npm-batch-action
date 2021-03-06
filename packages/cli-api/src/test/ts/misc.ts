import { IBaseConfig } from '@qiwi/npm-batch-cli-api'
import { NpmRegClientWrapper, RegClient } from '@qiwi/npm-batch-client'

import { npmRegClientWrapperFactory, printResults, printResultsJson } from '../../main/ts/utils'

describe('printResults', function () {
  it('prints successful results only when they are presented', () => {
    const consoleMock = {
      log: jest.fn(),
      table: jest.fn(),
      error: jest.fn()
    }
    const successfulPackages = [{ foo: 42 }, { foo: 42 }, { foo: 42 }]
    const failedPackages: any[] = []
    const successfulPackagesFields = ['foo']
    const failedPackagesFields = ['bar']
    printResults(
      successfulPackages,
      failedPackages,
      ['foo'],
      ['bar'],
      'success',
      'error',
      consoleMock as any
    )
    expect(consoleMock.log).toHaveBeenCalledWith('success')
    expect(consoleMock.table).toHaveBeenCalledWith(successfulPackages, successfulPackagesFields)
    expect(consoleMock.error).not.toHaveBeenCalledWith('error')
    expect(consoleMock.table).not.toHaveBeenCalledWith(failedPackages, failedPackagesFields)
  })

  it('does not print successful results when they are not presented', () => {
    const consoleMock = {
      log: jest.fn(),
      table: jest.fn(),
      error: jest.fn()
    }
    const successfulPackages: any[] = []
    const failedPackages = [{ foo: 42 }, { foo: 42 }, { foo: 42 }]
    const successfulPackagesFields = ['foo']
    const failedPackagesFields = ['bar']
    printResults(
      successfulPackages,
      failedPackages,
      ['foo'],
      ['bar'],
      'success',
      'error',
      consoleMock as any
    )
    expect(consoleMock.log).not.toHaveBeenCalledWith('success')
    expect(consoleMock.table).not.toHaveBeenCalledWith(successfulPackages, successfulPackagesFields)
    expect(consoleMock.error).toHaveBeenCalledWith('error')
    expect(consoleMock.table).toHaveBeenCalledWith(failedPackages, failedPackagesFields)
  })
})

describe('printResultsJson', () => {
  it('calls JSON.stringify and console.log', () => {
    const consoleMock = {
      log: jest.fn()
    }
    const stringifySpy = jest.spyOn(JSON, 'stringify')
      .mockImplementation(() => '')
    printResultsJson(
      { successfulPackages: [], failedPackages: [] },
      consoleMock as any
    )
    expect(stringifySpy).toHaveBeenCalled()
    expect(consoleMock.log).toHaveBeenCalled()
  })
})

describe('npmRegClientWrapperFactory', () => {
  it('returns instance of NpmRegClientWrapperFactory', () => {
    const config: IBaseConfig<string[]> = {
      registryUrl: 'http://localhost',
      auth: {
        token: 'foo'
      },
      action: 'deprecate',
      data: []
    }
    const wrapper = npmRegClientWrapperFactory(config, [], new RegClient())
    expect(wrapper).toBeInstanceOf(NpmRegClientWrapper)
  })
})
