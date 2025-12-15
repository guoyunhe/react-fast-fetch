import React, { ReactNode } from 'react';
import { FetchConfig } from './FetchConfig';
import { defaultFetcher, defaultStore, FetchContext } from './private/FetchContext';

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
