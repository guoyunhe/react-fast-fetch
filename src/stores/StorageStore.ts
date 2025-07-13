import { Store } from '../types';

interface StorageStoreRecord {
  url: string;
  data: string;
  timestamp: number;
}

export interface StorageStoreOptions {
  /**
   * Use localStorage or sessionStorage.
   *
   * @default localStorage
   */
  storage?: Storage;

  /**
   * Storage key prefix
   *
   * @default 'react-fast-fetch'
   */
  prefix?: string;

  /**
   * Maximum number of records kept in storage.
   *
   * Note: localStorage or sessionSotrage has a hard limit of 5MB. StorageStore will clean up old
   * records when storage is full, event if the `limit` isn't reached.
   *
   * @default 1000
   */
  limit?: number;
}

export class StorageStore implements Store, StorageStoreOptions {
  storage = window.localStorage;
  prefix = 'react-fast-fetch';
  limit = 1000;

  /**
   * Memory cache for faster access, the limit is the same as storage
   */
  private cache: Map<string, StorageStoreRecord>;

  constructor(options?: StorageStoreOptions) {
    if (options) {
      Object.assign(this, options);
    }

    // read storage
    this.cache = new Map<string, StorageStoreRecord>();
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key.startsWith(this.prefix)) {
        const value = this.storage.getItem(key);
        if (value) {
          try {
            const parsedValue = JSON.parse(value);
            const url = key.substring(this.prefix.length);
            this.cache.set(url, parsedValue);
          } catch {
            this.storage.removeItem(key);
          }
        }
      }
    }
  }

  async get(url: string) {
    return this.cache.get(url)?.data;
  }

  async set(url: string, data: any) {
    const record = { url, data, timestamp: Date.now() };
    this.cache.set(url, record);

    const storageKey = this.prefix + url;
    const storageValue = JSON.stringify(record);
    try {
      this.storage.setItem(storageKey, storageValue);
    } catch {
      // If storage is full, clean up and try again
      this.clean();
      this.storage.setItem(storageKey, storageValue);
    }

    // If size reached limit, clean up
    if (this.cache.size > this.limit) {
      this.clean();
    }
  }

  /**
   * Storage is full or reach limit, clean up the oldest 10% of records
   */
  async clean() {
    const amount = this.cache.size * 0.1;
    Array.from(this.cache.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((item, index) => {
        if (index < amount) {
          this.remove(item.url);
        }
      });
  }

  async remove(url: string) {
    this.cache.delete(url);
    const storageKey = this.prefix + url;
    this.storage.removeItem(storageKey);
  }
}
