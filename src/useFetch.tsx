import { useCallback, useEffect, useState } from 'react';
import { useFetchConfig } from '.';
import { DataStatus, FetchConfig, LoadStatus } from './types';

export interface UseFetchReturn<T> {
  /**
   * Fetched data, load immediately from cache and then reload from remote
   */
  data: T | undefined;
  setData: (data: T | undefined) => void;
  /**
   * If the data is absent, stale, or loaded
   */
  dataStatus: DataStatus;
  /**
   * The fetch request status
   */
  loadStatus: LoadStatus;
  /**
   * Fetch data from remote
   */
  reload: () => Promise<void>;
}

export function useFetch<T>(url: string, options: Partial<FetchConfig> = {}): UseFetchReturn<T> {
  const config = useFetchConfig();
  const fetcher = options.fetcher || config.fetcher;
  const store = options.store || config.store;
  const [data, setData] = useState<T>();
  const [dataStatus, setDataStatus] = useState(DataStatus.Absent);
  const [loadStatus, setLoadStatus] = useState(LoadStatus.Idle);

  // fetch data from remote
  const reload = useCallback(async () => {
    setLoadStatus(LoadStatus.Loading);
    try {
      const data = await fetcher(url);
      setLoadStatus(LoadStatus.Done);
      setDataStatus(DataStatus.Loaded);
      setData(data);
      store.set(url, data); // update cache
    } catch (e) {
      setLoadStatus(LoadStatus.Failed);
      throw e;
    }
  }, [fetcher, store, url]);

  useEffect(() => {
    let refreshed = false;
    // read cache
    store.get(url).then((data) => {
      if (!refreshed) {
        // avoid cached data overriding remote data
        setDataStatus(DataStatus.Stale);
        setData(data);
      }
    });
    // refresh data
    reload().then(() => {
      refreshed = true;
    });
  }, [url, store, reload]);

  return {
    data,
    setData,
    dataStatus,
    loadStatus,
    reload,
  };
}
