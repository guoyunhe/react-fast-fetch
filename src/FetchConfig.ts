import { Store } from './Store';

export interface FetchConfig {
  fetcher: (url: string) => Promise<any>;
  store: Store;
  initData: Record<string, any>;
}
