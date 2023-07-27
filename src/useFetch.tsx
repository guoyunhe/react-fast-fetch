import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetchConfig } from './FetchConfigContext';
import { DataStatus, FetchConfig } from './types';

export interface UseFetchOptions<T> extends Partial<FetchConfig> {
  /**
   * Disable data fetching. This is useful when some parameters is required to fetch data.
   */
  disabled?: boolean;
  /**
   * Callback when the intial load is done.
   */
  onLoad?: (url: string, data: T) => void;
  /**
   * Callback when data is reloaded.
   */
  onReload?: (url: string, data: T) => void;
}

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

export function useFetch<T>(url: string, options: UseFetchOptions<T> = {}): UseFetchReturn<T> {
  const config = useFetchConfig();
  const fetcher = options.fetcher || config.fetcher;
  const store = options.store || config.store;
  const { disabled, onLoad, onReload } = options;

  // Remember these props and use in async functions
  const urlRef = useRef(url);
  urlRef.current = url;
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
    console.log('reload');
    if (url === urlRef.current) {
      if (loadedUrlRef.current === urlRef.current) {
        console.log('reloading');
        setReloading(true);
        setLoading(false);
      } else {
        console.log('loading');
        setLoading(true);
        setReloading(false);
      }
      setError(null);
    }
    return fetcher(url)
      .then((data) => {
        if (url === urlRef.current) {
          setDataStatus(DataStatus.Valid);
          setData(data);
          onReloadRef.current?.(urlRef.current, data);
          loadedUrlRef.current = url;
        }
        store.set(url, data); // update cache
      })
      .catch((e) => {
        if (url === urlRef.current) {
          setError(e);
        }
      })
      .finally(() => {
        setReloading(false);
        setLoading(false);
      });
  }, [fetcher, store, url]);

  const remove = useCallback(() => store.remove(url), [store, url]);

  useEffect(() => {
    if (!disabled) {
      setDataStatus(DataStatus.Absent);
      // load remote data
      reload();
      // read cached data
      store.has(url).then((exist) => {
        if (exist) {
          store.get(url).then((data) => {
            // avoid cached data overriding remote data
            if (loadedUrlRef.current !== url && url === urlRef.current) {
              setDataStatus(DataStatus.Stale);
              setData(data);
              loadedUrlRef.current = url;
              setLoading(false);
            }
          });
        }
      });
    }
  }, [url, store, reload, disabled]);

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
