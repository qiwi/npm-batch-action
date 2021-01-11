import nock from 'nock'
import { join } from 'path'

import {
  IDeprecatePackageParams,
  IPackageParams,
  NpmRegClientWrapper,
  TNpmRegClientAuth, TPackageAccess,
  TTarballOpts
} from '../../main/ts'
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

beforeEach(() => jest.restoreAllMocks())

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
    expect(mock.isDone()).toEqual(true)
  })

  test('getBatch', async () => {
    const packageNames = [
      'foo',
      'bar',
      'baz'
    ]

    const mocks = packageNames.map(
      packageName => nock(url)
        .get(`/${packageName}`)
        .reply(200, packageInfo)
    )

    await expect(wrapper.getBatch(packageNames)).resolves.toMatchObject(new Array(3).fill(packageInfo))
    expect(mocks.filter(mock => mock.isDone())).toHaveLength(packageNames.length)
  })

  test('deprecateBatch makes batch calls to REST API', async () => {
    const params: Array<IDeprecatePackageParams & { verifier: Parameters<typeof prepareMocks>['1'] }> = [
      {
        packageName: 'foo',
        version: '>1.1.0',
        message: 'foo is deprecated',
        verifier: (body: any) => body.versions['1.2.0'].deprecated === 'foo is deprecated'
      },
      {
        packageName: 'bar',
        version: '*',
        message: 'bar is deprecated', // eslint-disable-line sonarjs/no-duplicate-string
        verifier: (body: any) => body.versions['1.2.0'].deprecated === 'bar is deprecated' &&
          body.versions['1.1.0'].deprecated === 'bar is deprecated'
      },
      {
        packageName: 'baz',
        version: '<1.2.0',
        message: 'baz is deprecated',
        verifier: (body: any) => body.versions['1.1.0'].deprecated === 'baz is deprecated'
      },
    ]

    const mocks = params.map(({ packageName, verifier }) => prepareMocks(packageName, verifier))

    await wrapper.deprecateBatch(params)
    expect(mocks.reduce(
      (acc, { infoMock, updateMock }: any) => acc && infoMock.isDone() && updateMock.isDone(),
      true
    )).toEqual(true)
  })

  test('unDeprecate calls deprecate with an empty message', async () => {
    const wrapper = new NpmRegClientWrapper('localhost', auth)
    const deprecateSpy = jest.spyOn(wrapper, 'deprecate')
      .mockImplementation(() => Promise.resolve())
    await wrapper.unDeprecate('foo', 'bar')
    expect(deprecateSpy).toHaveBeenCalledWith('foo', 'bar', '')
  })

  test('unDeprecateBatch calls deprecateBatch with an empty message', async () => {
    const params: IPackageParams[] = [
      { packageName: 'foo', version: '*' },
      { packageName: 'bar', version: '*' },
    ]
    const wrapper = new NpmRegClientWrapper('localhost', auth)
    const deprecateBatchSpy = jest.spyOn(wrapper, 'deprecateBatch')
      .mockImplementation(() => Promise.resolve([]))
    await wrapper.unDeprecateBatch(params, false)
    expect(deprecateBatchSpy).toHaveBeenCalledWith(
      expect.arrayContaining(
        [
          expect.objectContaining({ message: '' }),
          expect.objectContaining({ message: '' })
        ]
      ),
      false
    )
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

  test('publishBatch calls performBatchActions', async () => {
    const wrapper = new NpmRegClientWrapper(url, { token: 'token' })
    const filepath = {
      version: '1.0.0',
      filePath: join(__dirname, 'resources', 'package.tar.gz'),
      access: 'public' as TPackageAccess
    }
    const opts: TTarballOpts[] = [
      {
        name: 'foo',
        ...filepath
      },
      {
        name: 'bar',
        ...filepath
      },
      {
        name: 'baz',
        ...filepath
      }
    ]
    const performBatchActionsSpy = jest.spyOn(NpmRegClientWrapper, 'performBatchActions')
      .mockImplementation(() => Promise.resolve(42))
    await wrapper.publishBatch(opts, true)
    expect(performBatchActionsSpy).toHaveBeenCalledWith(opts, expect.any(Function), true)
  })

  describe('performBatchActions', function () {
    const params = Array.from({ length: 5 }, (_, i) => i)

    it('throws an error without skipErrors', () => {
      return expect(
        NpmRegClientWrapper.performBatchActions(params, actionFactory)
      ).rejects.toBe(error)
    })

    it('continues processing with skipErrors when error occurs', async () => {
      const data = await NpmRegClientWrapper.performBatchActions(params, actionFactory, true)
      expect(data).toHaveLength(params.length)
      expect(data.filter((item: any) => item.status === 'fulfilled')).toHaveLength(3)
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
