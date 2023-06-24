import { createContext } from 'react';
import { Fetcher } from './types';

export interface FetchContextValue {
  fetcher: Fetcher;
}

export const FetchContext = createContext<FetchContextValue>({
  fetcher: (url) => fetch(url).then((res) => res.json()),
});
