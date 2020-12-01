import { IBaseConfig, run } from '../../main/ts'
import * as deprecation from '../../main/ts/executors/deprecation'
import * as utils from '../../main/ts/utils/misc'
import * as validators from '../../main/ts/utils/validators'

const config: IBaseConfig = {
  registryUrl: 'http://localhost',
  auth: {
    username: 'username',
    password: 'password',
  },
  action: 'deprecate',
  data: []
}

beforeEach(() => jest.restoreAllMocks())

describe('run', () => {
  it('reads and validates config', () => {
    const readSpy = jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify(config))
    const baseValidatorSpy = jest.spyOn(validators, 'validateBaseConfig')
    run({ config: 'foo' })
    expect(readSpy).toHaveBeenCalled()
    expect(baseValidatorSpy).toHaveBeenCalled()
  })

  it('calls performDeprecation for deprecate', () => {
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify(config))
    const spy = jest.spyOn(deprecation, 'performDeprecation')
    run({ config: 'foo' })
    expect(spy).toHaveBeenCalled()
  })

  it('calls performDeprecation for un-deprecate', () => {
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify({ ...config, action: 'un-deprecate' }))
    const spy = jest.spyOn(deprecation, 'performDeprecation')
    run({ config: 'foo' })
    expect(spy).toHaveBeenCalled()
  })

  it('throws an error when action is not recognized', () => {
    jest.spyOn(utils, 'readFileToString')
      .mockImplementation(() => JSON.stringify({ ...config, action: 'foo' }))
    expect(() => run({ config: 'foo' })).toThrow()
  })
})
