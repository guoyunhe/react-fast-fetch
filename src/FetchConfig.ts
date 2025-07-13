import { Store } from './Store';
import { Fetcher } from './types';

export interface FetchConfig {
  fetcher: Fetcher;
  store: Store;
  initData: Record<string, any>;
}
