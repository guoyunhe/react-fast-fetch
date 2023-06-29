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
}

export function useFetch<T>(url: string, options: UseFetchOptions<T> = {}): UseFetchReturn<T> {
  const config = useFetchConfig();
  const fetcher = options.fetcher || config.fetcher;
  const store = options.store || config.store;
  const { disabled, onLoad, onReload } = options;

  // Remember these props and use in async functions
  const urlRef = useRef(url);
  urlRef.current = url;
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const onReloadRef = useRef(onReload);
  onReloadRef.current = onReload;

  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [dataStatus, setDataStatus] = useState(DataStatus.Absent);

  // initial fetch data from remote
  const load = useCallback(async () => {
    if (url === urlRef.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await fetcher(url);
      if (url === urlRef.current) {
        setLoading(false);
        setDataStatus(DataStatus.Valid);
        setData(data);
        onLoadRef.current?.(urlRef.current, data);
      }
      store.set(url, data); // update cache
    } catch (e) {
      if (url === urlRef.current) {
        setLoading(false);
        setError(e);
      }
    }
  }, [fetcher, store, url]);

  // refresh data from remote
  const reload = useCallback(async () => {
    if (url === urlRef.current) {
      setReloading(true);
      setError(null);
    }
    try {
      const data = await fetcher(url);
      if (url === urlRef.current) {
        setDataStatus(DataStatus.Valid);
        setData(data);
        setReloading(false);
        onReloadRef.current?.(urlRef.current, data);
      }
      store.set(url, data); // update cache
    } catch (e) {
      setReloading(false);
      setError(e);
    }
  }, [fetcher, store, url]);

  useEffect(() => {
    if (!disabled) {
      setLoading(false);
      setReloading(false);
      setDataStatus(DataStatus.Absent);
      setData(undefined);
      setError(undefined);
      store.has(url).then((exist) => {
        if (exist) {
          // read cache
          let loaded = false;
          store.get(url).then((data) => {
            if (!loaded && url === urlRef.current) {
              // avoid cached data overriding remote data
              setDataStatus(DataStatus.Stale);
              setData(data);
            }
          });
          // reload remote data
          reload().then(() => {
            loaded = true;
          });
        } else {
          // initial load
          load();
        }
      });
    }
  }, [url, store, load, reload, disabled]);

  return {
    data,
    error,
    dataStatus,
    reload,
    loading,
    reloading,
  };
}
