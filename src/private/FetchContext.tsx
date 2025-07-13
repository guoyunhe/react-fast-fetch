import { createContext } from 'react';
import { FetchConfig } from '../FetchConfig';
import { MemoryStore } from '../MemoryStore';

export const defaultFetcher = (url: string) => fetch(url).then((res) => res.json());
export const defaultStore = new MemoryStore();

export const FetchContext = createContext<FetchConfig>({
  fetcher: defaultFetcher,
  store: defaultStore,
  initData: {},
});
