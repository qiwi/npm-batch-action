import nock from 'nock'
import { join } from 'path'

import { NpmRegClientWrapper, TNpmRegClientAuth, TTarballOpts } from '../../main/ts'
import packageInfo from './resources/packageInfo.json'

const auth: TNpmRegClientAuth = {
  username: 'foo',
  password: 'bar',
  email: 'email@email.email',
  alwaysAuth: true
}

const error = new Error('foo')
const url = 'http://localhost'

const actionFactory = (i: number): Promise<string> =>
  i % 2 === 0
    ? Promise.resolve('bar')
    : Promise.reject(error)

beforeEach(jest.restoreAllMocks)

const prepareMocks = (packageName: string, bodyVerifier: (body: any) => boolean) => {
  const infoMock = nock(url)
    .get(`/${packageName}?write=true`)
    .reply(200, packageInfo)

  const updateMock = nock(url)
    .put(`/${packageName}`, bodyVerifier)
    .reply(200)

  return {
    infoMock,
    updateMock
  }
}

describe('NpmRegClientWrapper', () => {
  const wrapper = new NpmRegClientWrapper(url, auth)

  test('deprecate calls REST API with given message', () => {
    prepareMocks(
      'foo',
      (body: any) => {
        return body.versions['1.1.0'].deprecated === 'foo' &&
          body.versions['1.2.0'].deprecated === 'foo'
      }
    )
    return wrapper.deprecate('foo', '*', 'foo')
  })

  test('get calls REST API', async () => {
    const packageName = 'foo'
    const mock = nock(url)
      .get(`/${packageName}`)
      .reply(200, packageInfo)
    await expect(wrapper.get(packageName)).resolves.toMatchObject(packageInfo)
    expect(mock.isDone()).toBeTruthy()
  })

  test('unDeprecate calls deprecate with an empty message', async () => {
    const wrapper = new NpmRegClientWrapper('localhost', auth)
    const deprecateSpy = jest.spyOn(wrapper, 'deprecate')
      .mockImplementation(() => Promise.resolve(null)) // eslint-disable-line unicorn/no-null
    await wrapper.unDeprecate('foo', 'bar')
    expect(deprecateSpy).toHaveBeenCalledWith('foo', 'bar', '')
  })

  test('publish calls API', async () => {
    const wrapper = new NpmRegClientWrapper(url, { token: 'token' })
    const opts: TTarballOpts = {
      name: 'package',
      version: '1.0.0',
      filePath: join(__dirname, 'resources', 'package.tar.gz'),
      access: 'public'
    }
    const mock = nock(url)
      .put('/package')
      .reply(200)
    await wrapper.publish(opts)
    expect(mock.isDone()).toEqual(true)
  })

  describe('performBatchActions', function () {
    const params = Array.from({ length: 5 }, (_, i) => i)

    it('throws an error without skipErrors', () => {
      return expect(
        NpmRegClientWrapper.performBatchActions(params, actionFactory)
      ).rejects.toBe(error)
    })

    it('returns array of PromiseSettledResults', async () => {
      const results = await NpmRegClientWrapper.performBatchActions(
        [1, 2, 3],
        (value) => Promise.resolve(value)
      )
      expect(results).toEqual([
        {
          status: 'fulfilled',
          value: 1,
        },
        {
          status: 'fulfilled',
          value: 2,
        },
        {
          status: 'fulfilled',
          value: 3,
        },
      ])
    })

    it('continues processing with skipErrors when error occurs', async () => {
      const data = await NpmRegClientWrapper.performBatchActions(params, actionFactory, true)
      expect(data).toHaveLength(params.length)
      expect(data.filter((item: any) => item.status === 'fulfilled')).toHaveLength(3)
      expect(data.filter((item: any) => item.status === 'rejected')).toHaveLength(2)
    })
  });

  describe('getPackageUrl', function () {
    type TTestCase = {
      registryUrl: string,
      input: string,
      output: string,
    }
    const testCases: TTestCase[] = [
      { registryUrl: url, input: 'foo', output: 'http://localhost/foo' },
      { registryUrl: url, input: '@types/node', output: 'http://localhost/@types%2Fnode' },
      { registryUrl: url + '/', input: 'foo', output: 'http://localhost/foo' },
      { registryUrl: url + '/', input: '@types/node', output: 'http://localhost/@types%2Fnode' },
    ]

    testCases.forEach(({ registryUrl, input, output }) => {
      test(`registryUrl=${registryUrl}, input=${input} output=${output}`, () => {
        const wrapper = new NpmRegClientWrapper(registryUrl, auth)
        expect(wrapper.getPackageUrl(input)).toEqual(output)
      })
    })
  })

  describe('batch methods', () => {
    const batchMethods = [
      'deprecateBatch',
      'unDeprecateBatch',
      'getBatch',
      'publishBatch'
    ]
    const wrapper = new NpmRegClientWrapper(url, auth)
    batchMethods.forEach(async (method) =>
      it(`${method} calls performBatchActions`, async () => {
        const performBatchActionsSpy = jest.spyOn(NpmRegClientWrapper, 'performBatchActions')
          .mockImplementation(() => Promise.resolve([]))
        // @ts-ignore
        await wrapper[method]([], true)
        expect(performBatchActionsSpy).toHaveBeenCalledWith([], expect.any(Function), true)
      })
    )
  })

  describe('callbackFactory', () => {
    it('returns function', () => {
      expect(NpmRegClientWrapper.callbackFactory(
        () => { /* noop */
        },
        () => { /* noop */
        })
      )
        .toBeInstanceOf(Function)
    })

    test('returned function calls error cb', () => {
      const errorCb = jest.fn()
      const resolveCb = jest.fn()

      const cb = NpmRegClientWrapper.callbackFactory(resolveCb, errorCb)
      const error = new Error('error')
      cb(error, '')
      expect(errorCb).toHaveBeenCalledWith(error)
      expect(resolveCb).not.toHaveBeenCalled()
    })

    test('returned function calls resolver', () => {
      const errorCb = jest.fn()
      const resolveCb = jest.fn()
      const cb = NpmRegClientWrapper.callbackFactory(resolveCb, errorCb)
      const data = { foo: 42 }
      cb(undefined, data)
      expect(errorCb).not.toHaveBeenCalled()
      expect(resolveCb).toHaveBeenCalledWith(data)
    })
  })
});
