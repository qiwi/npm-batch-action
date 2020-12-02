declare module 'npm-registry-client' {
  type TAuth = { alwaysAuth?: boolean } & (
    {
      username: string
      password: string
      email?: string
    } | { token: string })

  type TPackage = {
    version: string
    message: string
  }

  type TCallback<T = any> = (error: any, data: T, raw: any, res: any) => void

  class RegClient {
    deprecate(
      uri: string,
      params: TPackage & { auth: TAuth },
      cb: TCallback
    ): void

    get(
      uri: string,
      params: any,
      cb: TCallback
    ): void
  }
  export = RegClient
}
