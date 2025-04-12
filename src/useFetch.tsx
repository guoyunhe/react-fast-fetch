import { useLatestCallback } from '@guoyunhe/use-latest-callback';
import { useLatestRef } from '@guoyunhe/use-latest-ref';
import { useEffect, useRef, useState } from 'react';
import { useFetchConfig } from './FetchConfigContext';
import { DataStatus, FetchOptions } from './types';
import { useNormalizedUrl } from './useNormalizedUrl';

export interface UseFetchReturn<T> {
  /**
   * Fetched data, load immediately from cache and then reload from remote
   */
  data: T | undefined;
  /**
   * Error while fetching data
   */
  error: any;
  /**
   * If the data is absent, stale, or valid
   */
  dataStatus: DataStatus;
  /**
   * Fetch data from remote
   */
  reload: () => Promise<void>;
  /**
   * Initial loading from remote
   */
  loading: boolean;
  /**
   * Reloading from remote
   */
  reloading: boolean;
  /**
   * Remove data from store. Call it when you delete the resource from remote.
   */
  remove: () => Promise<void>;
}

/**
 * Hook implementation of fast fetch
 */
export function useFetch<T>(url: string, options: FetchOptions<T> = {}): UseFetchReturn<T> {
  const config = useFetchConfig();
  const fetcher = options.fetcher || config.fetcher;
  const store = options.store || config.store;
  const { disabled, preserve, interval, onLoad, onReload } = options;

  const normalizedUrl = useNormalizedUrl(url, options.params);

  // Remember these props and use in async functions
  const urlRef = useLatestRef(normalizedUrl);
  const loadedUrlRef = useRef<string | null>(null);
  const onLoadRef = useLatestRef(onLoad);
  const onReloadRef = useLatestRef(onReload);

  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [dataStatus, setDataStatus] = useState(DataStatus.Absent);

  // refresh data from remote
  const reload = useLatestCallback(async () => {
    if (normalizedUrl === urlRef.current) {
      if (loadedUrlRef.current === urlRef.current) {
        setReloading(true);
        setLoading(false);
      } else {
        setLoading(true);
        setReloading(false);
      }
      setError(null);
    }

    try {
      const newData = await fetcher(normalizedUrl);
      if (normalizedUrl === urlRef.current) {
        setDataStatus(DataStatus.Valid);
        setData(newData);
        if (loadedUrlRef.current === urlRef.current) {
          onReloadRef.current?.(urlRef.current, newData);
        } else {
          onLoadRef.current?.(urlRef.current, newData);
        }
        loadedUrlRef.current = normalizedUrl;
      }
      store.set(normalizedUrl, newData); // update cache
    } catch (e) {
      if (normalizedUrl === urlRef.current) {
        setError(e);
      }
    }
    setReloading(false);
    setLoading(false);
  });

  const remove = useLatestCallback(() => store.remove(normalizedUrl));

  useEffect(
    () => {
      if (!disabled) {
        if (!preserve) {
          setDataStatus(DataStatus.Absent);
          setData(undefined);
        }
        // load remote data
        reload();
        // read cached data
        store.has(normalizedUrl).then((exist) => {
          if (exist) {
            store.get(normalizedUrl).then((newData) => {
              // avoid cached data overriding remote data
              if (loadedUrlRef.current !== normalizedUrl && normalizedUrl === urlRef.current) {
                setDataStatus(DataStatus.Stale);
                setData(newData);
                loadedUrlRef.current = normalizedUrl;
                setLoading(false);
              }
            });
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
    dataStatus,
    reload,
    remove,
    loading,
    reloading,
  };
}
