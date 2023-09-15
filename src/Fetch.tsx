import { FetchOptions } from './types';
import { useFetch } from './useFetch';

export interface OnInitOptions {
  reload: () => void;
  remove: () => void;
}

export interface FetchProps<T> extends FetchOptions<T> {
  url: string;
  onInit?: (options: OnInitOptions) => void;
}

/**
 * Component implementation of fast fetch, for class components.
 * Actually, it is only a thin wrapper of the `useFetch()` hook.
 */
export function Fetch<T>({ url, onInit, ...options }: FetchProps<T>) {
  const { reload, remove } = useFetch(url, options);
  onInit?.({ reload, remove });
  return null;
}
