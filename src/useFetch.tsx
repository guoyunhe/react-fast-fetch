import { useLatestCallback } from '@guoyunhe/use-latest-callback';
import { useLatestRef } from '@guoyunhe/use-latest-ref';
import { useContext, useEffect, useRef, useState } from 'react';
import { FetchOptions } from './FetchOptions';
import { FetchContext } from './private/FetchContext';
import { normalizeUrl } from './private/normalizeUrl';

export interface UseFetchReturn<T> {
  /**
   * Fetched data, load immediately from cache and then reload from remote
   */
  data: T | undefined;
  /**
   * Error thrown when fetching failed
   */
  error: any;
  /**
   * Fetch data from remote
   */
  reload: () => Promise<void>;
  /**
   * Initial loading from remote
   */
  loading: boolean;
  /**
   * Remove data from store. Call it when you delete the resource from remote.
   */
  remove: () => Promise<void>;
}

/**
 * Hook implementation of fast fetch
 */
export function useFetch<T>(url: string, options: FetchOptions<T> = {}): UseFetchReturn<T> {
  const config = useContext(FetchContext);
  const fetcher = options.fetcher || config.fetcher;
  const store = options.store || config.store;
  const { disabled, preserve, interval, onLoad } = options;

  const normalizedUrl = normalizeUrl(url, options.params);

  // Remember these props and use in async functions
  const urlRef = useLatestRef(normalizedUrl);
  // Loaded (not cached) url
  const loadedUrlRef = useRef<string | null>(null);
  const onLoadRef = useLatestRef(onLoad);

  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(true);

  // refresh data from remote
  const reload = useLatestCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newData = await fetcher(normalizedUrl);
      // abort out-dated promise
      if (normalizedUrl === urlRef.current) {
        setData(newData);
        setLoading(false);
        onLoadRef.current?.(urlRef.current, newData);
        loadedUrlRef.current = normalizedUrl;
        store.set(normalizedUrl, newData); // update cache
      }
    } catch (e) {
      // abort out-dated promise
      if (normalizedUrl === urlRef.current) {
        setError(e);
        setLoading(false);
      }
    }
  });

  const remove = useLatestCallback(() => store.remove(normalizedUrl));

  useEffect(
    () => {
      if (!preserve) {
        setData(undefined);
      }

      if (!disabled) {
        // load remote data
        reload();
        // read cached data
        store.get(normalizedUrl).then((newData) => {
          if (
            // avoid cached data overriding remote data
            loadedUrlRef.current !== normalizedUrl &&
            // abort out-dated promise
            normalizedUrl === urlRef.current
          ) {
            setData(newData);
            setLoading(false);
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalizedUrl, store, fetcher, reload, disabled, preserve, ...(options.dependencies || [])],
  );

  useEffect(() => {
    let timer = 0;
    if (!disabled && interval) {
      timer = window.setInterval(reload, interval);
    }
    return () => {
      window.clearInterval(timer);
    };
  }, [reload, disabled, interval]);

  return {
    data,
    error,
    reload,
    remove,
    loading,
  };
}
