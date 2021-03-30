import { NpmRegClientWrapper, TNpmRegClientAuth } from '../../main/ts'
import { NpmRegClientBatchWrapper } from '../../main/ts/batchWrapper'

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

describe('NpmRegClientBatchWrapper', () => {
  describe('performBatchActions', function () {
    const params = Array.from({ length: 5 }, (_, i) => i)

    it('throws an error without skipErrors', () => {
      return expect(
        NpmRegClientBatchWrapper.performBatchActions(params, actionFactory)
      ).rejects.toBe(error)
    })

    it('returns array of PromiseSettledResults', async () => {
      const results = await NpmRegClientBatchWrapper.performBatchActions(
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
      const data = await NpmRegClientBatchWrapper.performBatchActions(params, actionFactory, true)
      expect(data).toHaveLength(params.length)
      expect(data.filter((item: any) => item.status === 'fulfilled')).toHaveLength(3)
      expect(data.filter((item: any) => item.status === 'rejected')).toHaveLength(2)
    })
  })

  describe('batch methods', () => {
    const batchMethods = [
      'deprecate',
      'unDeprecate',
      'getPackument',
      'publish',
      'setLatestTag',
    ]
    const wrapper = new NpmRegClientWrapper(url, auth)
    const batchWrapper = new NpmRegClientBatchWrapper(wrapper)
    batchMethods.forEach(async (method) =>
      it(`${method} calls performBatchActions`, async () => {
        const performBatchActionsSpy = jest.spyOn(NpmRegClientBatchWrapper, 'performBatchActions')
          .mockImplementation(() => Promise.resolve([]))
        // @ts-ignore
        await batchWrapper[method]([], true)
        expect(performBatchActionsSpy).toHaveBeenCalledWith([], expect.any(Function), true)
      })
    )
  })
})
