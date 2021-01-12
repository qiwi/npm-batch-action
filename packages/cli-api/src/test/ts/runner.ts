import { IBaseConfig, readConfigAndRun } from '../../main/ts'
import * as deprecation from '../../main/ts/executors/deprecation'
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

  it('calls performDeprecation for un-deprecate', () => {
    mockOutput()
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify({ ...config, action: 'un-deprecate' }))
    const spy = jest.spyOn(deprecation, 'performDeprecation')
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
