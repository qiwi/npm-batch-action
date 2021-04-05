import nock from 'nock'
import { join } from 'path'

import { NpmRegClientWrapper, TNpmRegClientAuth, TSetLatestTagOpts, TTarballOpts } from '../../main/ts'
import packageInfo from './resources/packageInfo.json'

const auth: TNpmRegClientAuth = {
  username: 'foo',
  password: 'bar',
  email: 'email@email.email',
  alwaysAuth: true
}

const url = 'http://localhost'

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

  test('getPackument calls REST API', async () => {
    const packageName = 'foo'
    const mock = nock(url)
      .get(`/${packageName}`)
      .reply(200, packageInfo)
    await expect(wrapper.getPackument(packageName)).resolves.toMatchObject(packageInfo)
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

  describe('getVersions', () => {
    it('returns versions', async () => {
      const name = 'foo'
      const wrapper = new NpmRegClientWrapper(url, { token: 'token' })
      const getPackumentMock = nock(url)
        .get(`/${name}`)
        .reply(200, packageInfo)

      const data = await wrapper.getVersions(name)
      expect(data).toEqual(['1.1.0', '1.2.0'])
      expect(getPackumentMock.isDone()).toEqual(true)
    })

    it('throws an error when versions are absent', async () => {
      const wrapper = new NpmRegClientWrapper(url, { token: 'token' })
      const opts: TSetLatestTagOpts = {
        name: 'foo'
      }
      const getPackumentMock = nock(url)
        .get(`/${opts.name}`)
        .reply(200, {})

      await expect(wrapper.getVersions(opts.name))
        .rejects.toThrowError('Versions are absent for foo')

      expect(getPackumentMock.isDone()).toEqual(true)
    })
  })

  describe('setLatest', () => {
    it('calls API', async () => {
      const wrapper = new NpmRegClientWrapper(url, { token: 'token' })
      const opts: TSetLatestTagOpts = {
        version: '1.0.0',
        name: 'foo'
      }
      const mock = nock(url)
        .put('/-/package/foo/dist-tags/latest')
        .reply(200, { success: true })
      const data = await wrapper.setLatestTag(opts)
      expect(data).toEqual({ success: true })
      expect(mock.isDone()).toEqual(true)
    })

    it('resolves latest version', async () => {
      const wrapper = new NpmRegClientWrapper(url, { token: 'token' })
      const opts: TSetLatestTagOpts = {
        name: 'foo'
      }
      const getPackumentMock = nock(url)
        .get(`/${opts.name}`)
        .reply(200, packageInfo)
      const updateTagMock = nock(url)
        .put('/-/package/foo/dist-tags/latest')
        .reply(200, { success: true })

      const data = await wrapper.setLatestTag(opts)
      expect(data).toEqual({ success: true })
      expect(getPackumentMock.isDone()).toEqual(true)
      expect(updateTagMock.isDone()).toEqual(true)
    })
  })

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
