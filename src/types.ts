import { FetchConfig } from './FetchConfig';

export type Fetcher = (url: string) => Promise<any>;

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
   * When url or params changes, preserve old data before new data loaded. Enable when you want
   * smooth transition. However, old data may cause displaying wrong information. Use it carefully.
   */
  preserve?: boolean;
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
  /**
   * Other dependencies that trigger reloading.
   */
  dependencies?: any[];
}
