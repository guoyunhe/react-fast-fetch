import { FetchConfig } from './FetchConfig';

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
  onLoad?: (url: string, data: T) => void;
  /**
   * Other dependencies that trigger reloading.
   */
  dependencies?: any[];
}
