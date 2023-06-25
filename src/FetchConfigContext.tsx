import { ReactNode, createContext, useContext } from 'react';
import { MemoryStore } from './stores/MemoryStore';
import { FetchConfig } from './types';

const defaultFetcher = (url: string) => fetch(url).then((res) => res.json());
const defaultStore = new MemoryStore();

const FetchConfigContext = createContext<FetchConfig>({
  fetcher: defaultFetcher,
  store: defaultStore,
});

export interface FetchConfigProviderProps extends Partial<FetchConfig> {
  children?: ReactNode;
}

export function FetchConfigProvider({
  fetcher = defaultFetcher,
  store = defaultStore,
  children,
}: FetchConfigProviderProps) {
  return (
    <FetchConfigContext.Provider value={{ fetcher, store }}>{children}</FetchConfigContext.Provider>
  );
}

export function useFetchConfig() {
  return useContext(FetchConfigContext);
}
