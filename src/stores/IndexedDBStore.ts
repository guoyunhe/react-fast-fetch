import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { Store } from '../types';

interface StoreEntry {
  url: string;
  data: any;
  timestamp: number;
}

interface Schema extends DBSchema {
  store: {
    key: string;
    value: StoreEntry;
    indexes: {
      timestamp: number;
    };
  };
}

export interface IndexedDBStoreOptions {
  /**
   * Name of IndexedDB database
   *
   * @default 'react_fetch'
   */
  dbName?: string;
  /**
   * Maximum number of records in the Map
   *
   * @default 10000
   */
  limit?: number;
}

export class IndexedDBStore implements Store {
  // Memory cache for faster access
  map: Map<string, StoreEntry>;
  // Persist cache in IndexedDB
  db: IDBPDatabase<Schema> | null = null;

  dbName = 'react_fetch';
  dbVersion = 1;
  storeName = 'store';
  limit = 1000;

  constructor(options?: IndexedDBStoreOptions) {
    if (options?.dbName) {
      this.dbName = options.dbName;
    }
    if (options?.limit) {
      this.limit = options.limit;
    }
    this.map = new Map<string, StoreEntry>();
    this.init();
  }

  async init() {
    if (this.db) {
      return;
    }
    this.db = await openDB<Schema>(this.dbName, this.dbVersion, {
      upgrade: (db, oldVersion) => {
        if (oldVersion === 0) {
          const store = db.createObjectStore('store', {
            keyPath: 'url',
          });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  async has(url: string) {
    if (this.map.has(url)) {
      return true;
    }
    await this.init();
    const value = await this.db?.get('store', url);
    if (value) {
      this.map.set(url, value); // cache in memory
      return true;
    } else {
      return false;
    }
  }

  async get(url: string) {
    const memoryValue = this.map.get(url);
    if (memoryValue) {
      return memoryValue.data;
    }
    await this.init();
    const value = await this.db?.get('store', url);
    if (value) {
      this.map.set(url, value); // cache in memory
    }
    return value?.data;
  }

  async set(url: string, data: any) {
    const value = { url, data, timestamp: Date.now() };
    this.map.set(url, value); // cache in memory
    await this.init();
    await this.db?.put('store', value);
  }
}
