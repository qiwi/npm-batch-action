import { validateBaseConfig, validateDeprecationConfig, validatePublishConfig } from '../../../main/ts'

type TTestCase = {
  description: string
  input: any
  success: boolean
}

const auth = {
  username: '',
  password: '',
}

const validatorTestFactory = (validator: (data: any) => any) =>
  ({ description, success, input }: TTestCase) =>
    it(description, () => {
      if (success) {
        expect(validator(input)).toEqual(input)
      } else {
        expect(() => validator(input)).toThrow()
      }
    })

describe('validateBaseConfig', () => {
  const testCases: Array<TTestCase> = [
    {
      description: 'does not allow null',
      input: null, // eslint-disable-line unicorn/no-null
      success: false,
    },
    {
      description: 'requires registryUrl',
      input: {
        auth,
      },
      success: false,
    },
    {
      description: 'forces registryUrl to be a string',
      input: {
        auth,
        registryUrl: false
      },
      success: false,
    },
    {
      description: 'requires auth',
      input: {
        registryUrl: '',
      },
      success: false,
    },
    {
      description: 'forces auth to be an object',
      input: {
        auth: '',
        registryUrl: '',
      },
      success: false,
    },
    {
      description: 'requires action',
      input: {
        auth,
        registryUrl: '',
      },
      success: false,
    },
    {
      description: 'forces action to be a string',
      input: {
        auth,
        action: false,
        registryUrl: '',
      },
      success: false,
    },
    {
      description: 'returns correct config',
      input: {
        auth,
        action: 'deprecate',
        registryUrl: 'http://localhost',
      },
      success: true,
    },
  ]

  testCases.forEach(validatorTestFactory(validateBaseConfig))
})

const commonTestCases: TTestCase[] = [
  {
    description: 'does not allow config without data',
    input: {
      auth,
      action: 'deprecate',
    },
    success: false,
  },
  {
    description: 'does not allow config data of wrong type',
    input: {
      auth,
      action: 'deprecate',
      data: 'data',
    },
    success: false,
  },
  {
    description: 'allows array data',
    input: {
      auth,
      action: 'deprecate',
      data: [],
    },
    success: true,
  },
]

describe('validateDeprecationConfig', () => {
  const testCases: TTestCase[] = [
    ...commonTestCases,
    {
      description: 'allows array data with correct values',
      input: {
        auth,
        action: 'deprecate',
        data: [
          {
            packageName: 'foo',
            version: '1.0.0',
            message: 'message'
          },
          {
            packageName: 'bar',
            version: '1.0.0',
            message: 'message'
          }
        ],
      },
      success: true,
    },
    {
      description: 'does not allow array data with incorrect values',
      input: {
        auth,
        action: 'deprecate',
        data: [
          {
            packageName: 'foo',
            version: '1.0.0',
            message: 'message'
          },
          {
            packageName: 42,
            version: '1.0.0',
            message: 'message'
          }
        ],
      },
      success: false,
    },
  ]

  testCases.forEach(validatorTestFactory(validateDeprecationConfig))
})

describe('validatePublishConfig', () => {
  const testCases: TTestCase[] = [
    ...commonTestCases,
    {
      description: 'allows array data with correct values',
      input: {
        auth,
        action: 'deprecate',
        data: [
          {
            name: 'foo',
            version: '1.0.0',
            filePath: 'foo.tar.gz',
            access: 'public'
          },
          {
            name: 'bar',
            version: '1.0.0',
            filePath: 'bar.tar.gz',
            access: 'public'
          }
        ],
      },
      success: true,
    },
    {
      description: 'does not allow array data with incorrect values',
      input: {
        auth,
        action: 'deprecate',
        data: [
          {
            name: 'foo',
            version: '1.0.0',
            filePath: 'file.tar.gz',
            access: 'public'
          },
          {
            packageName: 42,
            version: '1.0.0',
            message: 'message'
          }
        ],
      },
      success: false,
    },
  ]

  testCases.forEach(validatorTestFactory(validatePublishConfig))
})
