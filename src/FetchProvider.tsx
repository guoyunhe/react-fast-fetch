import { ReactNode } from 'react';
import { defaultFetcher, defaultStore, FetchContext } from './private/FetchContext';
import { FetchConfig } from './types';

export interface FetchProviderProps extends Partial<FetchConfig> {
  children?: ReactNode;
}

export function FetchProvider({
  fetcher = defaultFetcher,
  store = defaultStore,
  initData = {},
  children,
}: FetchProviderProps) {
  return (
    <FetchContext.Provider value={{ fetcher, store, initData }}>{children}</FetchContext.Provider>
  );
}
