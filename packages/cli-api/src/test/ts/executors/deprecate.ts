import { NpmRegClientBatchWrapper, NpmRegClientWrapper } from '@qiwi/npm-batch-client'
import nock from 'nock'

import {
  performDeprecation,
  TDeprecationConfig
} from '../../../main/ts'
import * as misc from '../../../main/ts/utils/misc'
import { mockOutput } from '../utils'

const registryUrl = 'http://localhost'
const config: TDeprecationConfig = {
  registryUrl,
  auth: {
    username: 'username',
    password: 'password',
    email: 'email@email.email'
  },
  batch: {
    ratelimit: {
      period: 500,
      count: 2
    }
  },
  action: 'deprecate',
  data: [
    {
      packageName: 'foo',
      version: '<1.2.0',
      message: 'foo is deprecated',
    },
    {
      packageName: 'bar',
      version: '<1.3.0',
      message: 'bar is deprecated',
    },
    {
      packageName: 'baz',
      version: '<1.4.0',
      message: 'baz is deprecated',
    },
    {
      packageName: 'bat',
      version: '<1.5.0',
      message: 'bat is deprecated',
    },
  ]
}

const createMocks = () =>
  config.data.map(data => ({
    info: nock(registryUrl)
      .get(`/${data.packageName}?write=true`)
      .reply(200, { versions: { '0.1.0': {} } }),
    deprecate: nock(registryUrl)
      .put(`/${data.packageName}`)
      .reply(200, { success: true })
  }))

describe('performDeprecation', () => {
  beforeEach(() => jest.restoreAllMocks())
  const wrapper = new NpmRegClientWrapper(registryUrl, config.auth)
  const batchWrapper = new NpmRegClientBatchWrapper(wrapper)

  it('prints results in json', async () => {
    mockOutput()
    const mocks = createMocks()
    const printResultsJson = jest.spyOn(misc, 'printResultsJson')
      .mockImplementation(() => { /* noop */ })

    await performDeprecation({ ...config, batch: { ...config.batch, jsonOutput: true }}, batchWrapper)

    expect(mocks.every(item => item.info.isDone() && item.deprecate.isDone())).toEqual(true)
    expect(printResultsJson).toHaveBeenCalled()
  })
})
