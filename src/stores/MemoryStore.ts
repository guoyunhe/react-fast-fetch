import { Store } from '../types';

interface StoreEntry {
  url: string;
  data: any;
  timestamp: number;
}

export interface MemoryStoreOptions {
  /**
   * Maximum number of records in the Map
   *
   * @default 10000
   */
  limit?: number;
}

export class MemoryStore implements Store {
  map: Map<string, StoreEntry>;

  limit = 1000;

  constructor(options?: MemoryStoreOptions) {
    if (options?.limit) {
      this.limit = options.limit;
    }
    this.map = new Map<string, StoreEntry>();
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
