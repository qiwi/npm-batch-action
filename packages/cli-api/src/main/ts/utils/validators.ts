import assert from 'assert'

import { IBaseConfig, TDeprecationConfig, TGetConfig, TPublishConfig } from '../interfaces'
import { assertString } from './misc'

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
  assert.ok(Array.isArray(config.data), 'Data in config file should be an array') // eslint-disable-line sonarjs/no-duplicate-string
  config.data.forEach(({ packageName, version, message }) => {
    assertString(packageName, 'packageName')
    assertString(version, 'version')
    assertString(message, 'message')
  })
  return config
}

export const validatePublishConfig = (config: IBaseConfig): TPublishConfig => {
  assert.ok(Array.isArray(config.data), 'Data in config file should be an array') // eslint-disable-line sonarjs/no-duplicate-string
  config.data.forEach(({ name, version, filePath, access }) => {
    assertString(name, 'name')
    assertString(version, 'version')
    assertString(filePath, 'filePath')
    assert.ok(access === 'public' || access === 'restricted', 'access should be `public` or `restricted`')
  })
  return config
}

export const validateGetConfig = (config: IBaseConfig): TGetConfig => {
  assert.ok(Array.isArray(config.data), 'Data in config file should be an array') // eslint-disable-line sonarjs/no-duplicate-string
  if (!config.batch?.jsonOutput) {
    assertString(config.batch?.path, 'batch.path')
  }
  config.data.forEach(name => assertString(name, 'name'))
  return config
}
