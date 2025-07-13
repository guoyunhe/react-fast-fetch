import { createContext } from 'react';
import { MemoryStore } from '../MemoryStore';
import { FetchConfig } from '../types';

export const defaultFetcher = (url: string) => fetch(url).then((res) => res.json());
export const defaultStore = new MemoryStore();

export const FetchContext = createContext<FetchConfig>({
  fetcher: defaultFetcher,
  store: defaultStore,
  initData: {},
});
