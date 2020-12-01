import nock from 'nock'

import { performDeprecation, TDeprecationConfig } from '../../../main/ts'

describe('performDeprecation', () => {
  it ('makes API requests with rate limit', async () => {
    const registryUrl = 'http://localhost'
    const config: TDeprecationConfig = {
      registryUrl,
      auth: {
        username: 'username',
        password: 'password',
      },
      settings: {
        rate: {
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
    const mocks = config.data.map(data => ({
      info: nock(registryUrl)
        .get(`/${data.packageName}?write=true`)
        .reply(200, { versions: { '0.1.0': {} }}),
      deprecate: nock(registryUrl)
        .put(`/${data.packageName}`)
        .reply(200)
    }))
    const startTime = Date.now()
    await performDeprecation(config)
    const endTime = Date.now() - startTime
    expect(mocks.filter(item => item.info.isDone() && item.deprecate.isDone()))
      .toHaveLength(mocks.length)
    expect(endTime).toBeGreaterThanOrEqual(750)
  })
})
