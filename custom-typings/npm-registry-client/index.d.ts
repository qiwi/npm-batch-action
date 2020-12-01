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

  class RegClient {
    deprecate(
      uri: string,
      params: TPackage & { auth: TAuth },
      cb: (error: any, data: any, raw: any, res: any) => void
    ): void
  }
  export = RegClient
}
