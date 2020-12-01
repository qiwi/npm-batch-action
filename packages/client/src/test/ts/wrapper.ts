import nock from 'nock'

import { IDeprecatePackageParams, IPackageParams, NpmRegClientWrapper, TNpmRegClientAuth } from '../../main/ts'
import packageInfo from './resources/packageInfo.json'

const auth: TNpmRegClientAuth = {
  username: 'foo',
  password: 'bar'
}

const error = new Error('foo')
const url = 'http://localhost'

const actionFactory = (i: number): Promise<string> =>
  i % 2 === 0
    ? Promise.resolve('bar')
    : Promise.reject(error)

beforeEach(() => jest.resetAllMocks())

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
  });

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
  });
});