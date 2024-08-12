import { useCallback, useEffect, useRef, useState } from 'react';
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
  const { disabled, interval, onLoad, onReload } = options;

  const normalizedUrl = useNormalizedUrl(url, options.params);

  // Remember these props and use in async functions
  const urlRef = useRef(normalizedUrl);
  urlRef.current = normalizedUrl;
  const loadedUrlRef = useRef<string | null>(null);
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const onReloadRef = useRef(onReload);
  onReloadRef.current = onReload;

  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [dataStatus, setDataStatus] = useState(DataStatus.Absent);

  // refresh data from remote
  const reload = useCallback(() => {
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
    return fetcher(normalizedUrl)
      .then((data) => {
        if (normalizedUrl === urlRef.current) {
          setDataStatus(DataStatus.Valid);
          setData(data);
          onReloadRef.current?.(urlRef.current, data);
          loadedUrlRef.current = normalizedUrl;
        }
        store.set(normalizedUrl, data); // update cache
      })
      .catch((e) => {
        if (normalizedUrl === urlRef.current) {
          setError(e);
        }
      })
      .finally(() => {
        setReloading(false);
        setLoading(false);
      });
  }, [fetcher, store, normalizedUrl]);

  const remove = useCallback(() => store.remove(normalizedUrl), [store, normalizedUrl]);

  useEffect(
    () => {
      if (!disabled) {
        setDataStatus(DataStatus.Absent);
        setData(undefined);
        // load remote data
        reload();
        // read cached data
        store.has(normalizedUrl).then((exist) => {
          if (exist) {
            store.get(normalizedUrl).then((data) => {
              // avoid cached data overriding remote data
              if (loadedUrlRef.current !== normalizedUrl && normalizedUrl === urlRef.current) {
                setDataStatus(DataStatus.Stale);
                setData(data);
                loadedUrlRef.current = normalizedUrl;
                setLoading(false);
              }
            });
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalizedUrl, store, reload, disabled, ...(options.dependencies || [])],
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
