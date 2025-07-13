import { ReactNode, createContext, useContext } from 'react';
import { MemoryStore } from './MemoryStore';
import { FetchConfig } from './types';

const defaultFetcher = (url: string) => fetch(url).then((res) => res.json());
const defaultStore = new MemoryStore();

const FetchConfigContext = createContext<FetchConfig>({
  fetcher: defaultFetcher,
  store: defaultStore,
  initData: {},
});

export interface FetchConfigProviderProps extends Partial<FetchConfig> {
  children?: ReactNode;
}

export function FetchConfigProvider({
  fetcher = defaultFetcher,
  store = defaultStore,
  initData = {},
  children,
}: FetchConfigProviderProps) {
  return (
    <FetchConfigContext.Provider value={{ fetcher, store, initData }}>
      {children}
    </FetchConfigContext.Provider>
  );
}

export function useFetchConfig() {
  return useContext(FetchConfigContext);
}
