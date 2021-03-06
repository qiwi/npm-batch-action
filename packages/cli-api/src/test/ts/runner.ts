import { IBaseConfig, readConfigAndRun } from '../../main/ts'
import * as deprecation from '../../main/ts/executors/deprecate'
import * as get from '../../main/ts/executors/get'
import * as publish from '../../main/ts/executors/publish'
import * as setLatest from '../../main/ts/executors/setLatest'
import * as utils from '../../main/ts/utils/misc'
import * as validators from '../../main/ts/utils/validators'
import { mockOutput } from './utils'

const config: IBaseConfig = {
  registryUrl: 'http://localhost',
  auth: {
    username: 'username',
    password: 'password',
    email: 'email@email.email'
  },
  action: 'deprecate',
  data: []
}

beforeEach(() => jest.restoreAllMocks())

describe('readConfigAndRun', () => {
  it('reads and validates config', () => {
    mockOutput()
    const readSpy = jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify(config))
    const baseValidatorSpy = jest.spyOn(validators, 'validateBaseConfig')
    readConfigAndRun({ config: 'foo' })
    expect(readSpy).toHaveBeenCalled()
    expect(baseValidatorSpy).toHaveBeenCalled()
  })

  it('calls performDeprecation for deprecate', () => {
    mockOutput()
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify(config))
    const spy = jest.spyOn(deprecation, 'performDeprecation')
    readConfigAndRun({ config: 'foo' })
    expect(spy).toHaveBeenCalled()
  })

  it('calls performPublish for publish', () => {
    mockOutput()
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify({ ...config, action: 'publish' }))
    const spy = jest.spyOn(publish, 'performPublish')
    readConfigAndRun({ config: 'foo' })
    expect(spy).toHaveBeenCalled()
  })

  it('calls performGet for getPackument', () => {
    mockOutput()
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify({ ...config, action: 'get', batch: { path: '' } }))
    jest.spyOn(utils, 'writeToFile')
      .mockImplementation(() => { /* noop */ })
    const spy = jest.spyOn(get, 'performGet')
    readConfigAndRun({ config: 'foo' })
    expect(spy).toHaveBeenCalled()
  })


  it('calls performDeprecation for un-deprecate', () => {
    mockOutput()
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify({ ...config, action: 'un-deprecate' }))
    const spy = jest.spyOn(deprecation, 'performDeprecation')
    readConfigAndRun({ config: 'foo' })
    expect(spy).toHaveBeenCalled()
  })

  it('calls performSetLatest for set-latest', () => {
    mockOutput()
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify({ ...config, action: 'set-latest' }))
    const spy = jest.spyOn(setLatest, 'performSetLatest')
    readConfigAndRun({ config: 'foo' })
    expect(spy).toHaveBeenCalled()
  })

  it('throws an error when action is not recognized', () => {
    mockOutput()
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify({ ...config, action: 'foo' }))
    expect(() => readConfigAndRun({ config: 'foo' })).toThrow()
  })
})
