import { useCallback, useEffect, useState } from 'react';
import { useFetchConfig } from './FetchConfigContext';
import { DataStatus, FetchConfig } from './types';

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

export function useFetch<T>(url: string, options: Partial<FetchConfig> = {}): UseFetchReturn<T> {
  const config = useFetchConfig();
  const fetcher = options.fetcher || config.fetcher;
  const store = options.store || config.store;
  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [dataStatus, setDataStatus] = useState(DataStatus.Absent);

  // initial fetch data from remote
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher(url);
      setDataStatus(DataStatus.Valid);
      setLoading(false);
      setData(data);
      store.set(url, data); // update cache
    } catch (e) {
      setLoading(false);
      setError(e);
      throw e;
    }
  }, [fetcher, store, url]);

  // refresh data from remote
  const reload = useCallback(async () => {
    setReloading(true);
    setError(null);
    try {
      const data = await fetcher(url);
      setDataStatus(DataStatus.Valid);
      setData(data);
      setReloading(false);
      store.set(url, data); // update cache
    } catch (e) {
      setReloading(false);
      setError(e);
      throw e;
    }
  }, [fetcher, store, url]);

  useEffect(() => {
    let loaded = false;
    store
      .has(url)
      .then((exist) => {
        if (exist) {
          // read cache
          store.get(url).then((data) => {
            if (!loaded) {
              // avoid cached data overriding remote data
              setDataStatus(DataStatus.Stale);
              setData(data);
            }
          });
        }
        // refresh data
        load().then(() => {
          loaded = true;
        });
      })
      .catch((e) => {
        // refresh data
        load().then(() => {
          loaded = true;
        });
        throw e;
      });
  }, [url, store, load]);

  return {
    data,
    error,
    dataStatus,
    reload,
    loading,
    reloading,
  };
}
