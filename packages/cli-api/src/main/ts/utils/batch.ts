export type TEnrichedBatchResult<T = any, R = any> = {
  opts: T
  res: PromiseSettledResult<R>
}

export type TEnrichedFulfilledResult<T = any, R = any> = {
  opts: T
  res: PromiseFulfilledResult<R>
}

export type TEnrichedRejectedResult<T = any> = {
  opts: T
  reason: string
}

export type TParsedResults<T, R> = {
  successful: TEnrichedFulfilledResult<T, R>[]
  failed: TEnrichedRejectedResult<T>[]
}

export const enrichResults = <T, R>(
  opts: T[],
  results: PromiseSettledResult<R>[]
): TEnrichedBatchResult<T, R>[] => {
  return results.map((res, i) => ({ opts: opts[i], res }))
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return error ? JSON.stringify(error) : 'no data'
}

export const getFailedResults = <T, R>(
  results: TEnrichedBatchResult<T, R>[],
  isFailed?: (result: PromiseFulfilledResult<R>) => boolean
): TEnrichedRejectedResult[] => {
  return results
    .filter((result: TEnrichedBatchResult<T>) => result.res.status === 'rejected' || (isFailed && isFailed(result.res)))
    .map((item: TEnrichedBatchResult<T>) => ({
      ...item,
      reason: getErrorMessage(item.res.status === 'rejected' ? item.res.reason : item.res.value?.error)
    }))
}

export const getSuccessfulResults = <T, R>(
  results: TEnrichedBatchResult<T, R>[],
  isFailed?: (result: PromiseFulfilledResult<R>) => boolean
): TEnrichedFulfilledResult<T, R>[] => {
  return results
    .filter((result: TEnrichedBatchResult<T>): result is TEnrichedFulfilledResult<T, R> =>
      result.res.status === 'fulfilled' && (isFailed ? !isFailed(result.res) : true)
    )
}

const defaultFailChecker = (item: PromiseFulfilledResult<any>): boolean => !item?.value?.success

export const parseResults = <T, R>(
  opts: T[],
  results: PromiseSettledResult<R>[],
  isFailed = defaultFailChecker
): TParsedResults<T, R> => {
  const enrichedResults = enrichResults<T, R>(opts, results)
  return {
    successful: getSuccessfulResults<T, R>(enrichedResults, isFailed),
    failed: getFailedResults<T, R>(enrichedResults, isFailed)
  }
}
