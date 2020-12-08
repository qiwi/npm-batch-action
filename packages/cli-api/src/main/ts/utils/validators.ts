import assert from 'assert'

import { IBaseConfig, TDeprecationConfig } from '../interfaces'

const isObject = (data: any) => typeof data === 'object' && data !== null

export const validateBaseConfig = (config: any): IBaseConfig => { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  assert.ok(isObject(config))
  assert.ok(
    !!config.registryUrl && typeof config.registryUrl === 'string',
    'Registry url is missing or has wrong type, should be a string'
  )
  assert.ok(
    isObject(config.auth),
    'Auth is missing or has wrong type, should be an object'
  )
  assert.ok(
    !!config.action && typeof config.action === 'string',
    'Action is missing or has wrong type, should be a string'
  )
  return config
}

export const validateDeprecationConfig = (config: IBaseConfig): TDeprecationConfig => {
  assert.ok(Array.isArray(config.data), 'Data in config file should be an array')
  return config
}
