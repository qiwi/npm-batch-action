import { TRateLimit } from './interfaces'

export const defaultRateLimit: TRateLimit = {
  period: 1000,
  count: 10,
}
