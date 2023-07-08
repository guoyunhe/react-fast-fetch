export type Fetcher = (url: string) => Promise<any>;

export interface Store {
  get: (url: string) => Promise<any>;
  set: (url: string, data: any) => Promise<void>;
  remove: (url: string) => Promise<void>;
  has: (url: string) => Promise<boolean>;
}

export interface FetchConfig {
  fetcher: Fetcher;
  store: Store;
}

export enum DataStatus {
  // Not fetched yet
  Absent,
  // Read from local cache
  Stale,
  // Fetched from remote
  Valid,
}
