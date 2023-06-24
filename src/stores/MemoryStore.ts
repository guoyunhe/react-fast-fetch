import { Store } from '../types';

export interface MemoryStoreOptions {
  /**
   * Maximum number of records in the Map
   *
   * @default 10000
   */
  limit?: number;
}

export class MemoryStore implements Store {
  map: Map<string, any>;

  limit = 1000;

  constructor(options?: MemoryStoreOptions) {
    if (options?.limit) {
      this.limit = options.limit;
    }
    this.map = new Map();
  }

  async has(url: string) {
    return this.map.has(url);
  }

  async get(url: string) {
    return this.map.get(url)?.data;
  }

  async set(url: string, data: any) {
    this.map.set(url, { url, data, timestamp: Date.now() });
  }
}
