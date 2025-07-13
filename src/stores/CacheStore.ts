import { Store } from '../types';

export interface CacheStoreOptions {
  /**
   * Cache name
   * @default 'react-fast-fetch'
   */
  name?: string;
}

/**
 * Store implementated with [Cache API](https://developer.mozilla.org/docs/Web/API/Cache)
 */
export class CacheStore implements Store {
  private cache: Promise<Cache>;
  private options: CacheStoreOptions = {};

  constructor(options?: CacheStoreOptions) {
    if (options) {
      Object.assign(this.options, options);
    }
    this.cache = caches.open(this.options.name || 'react-fast-fetch');
  }

  get = (url: string): Promise<any> => {
    const request = new Request(url);
    return this.cache.then((cache) => cache.match(request)).then((response) => response?.json());
  };

  set = (url: string, data: any): Promise<void> => {
    const request = new Request(url);
    return this.cache.then((cache) => cache.put(request, new Response(JSON.stringify(data))));
  };

  remove = (url: string): Promise<any> => {
    const request = new Request(url);
    return this.cache.then((cache) => cache.delete(request));
  };
}
