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

export type OnLoad<T> = (url: string, data: T) => void;

export interface FetchOptions<T> extends Partial<FetchConfig> {
  /**
   * Search parameters
   */
  params?: any;
  /**
   * Disable data fetching. This is useful when some parameters is required to fetch data.
   */
  disabled?: boolean;
  /**
   * Auto-reload interval in milliseconds
   */
  interval?: number;
  /**
   * Callback when the intial load is done.
   */
  onLoad?: OnLoad<T>;
  /**
   * Callback when data is reloaded.
   */
  onReload?: OnLoad<T>;
}
