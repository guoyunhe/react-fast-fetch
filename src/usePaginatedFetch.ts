import { FetchOptions } from './types';
import { useFetch, UseFetchReturn } from './useFetch';

export function usePaginatedFetch<T>(
  url: string,
  options: FetchOptions<T> = {},
): UseFetchReturn<T> {
  return useFetch(url, options);
}
