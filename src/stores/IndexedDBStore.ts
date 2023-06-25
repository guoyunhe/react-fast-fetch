import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { Store, StoreEntry } from '../types';

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
  private map: Map<string, StoreEntry>;
  // Persist cache in IndexedDB
  private db: IDBPDatabase<Schema> | null = null;

  dbName = 'react_fetch';
  readonly dbVersion = 1;
  readonly storeName = 'store';
  limit = 1000;

  constructor(options?: IndexedDBStoreOptions) {
    if (options?.dbName) {
      this.dbName = options.dbName;
    }
    if (options?.limit) {
      this.limit = options.limit;
    }
    this.map = new Map();
    this.init();
  }

  async init() {
    if (this.db) {
      return;
    }
    this.db = await openDB<Schema>(this.dbName, this.dbVersion, {
      upgrade: (db, oldVersion, newVersion) => {
        console.log(oldVersion, newVersion);
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
    return !!value;
  }

  async get(url: string) {
    const memoryValue = this.map.get(url);
    if (memoryValue) {
      return memoryValue.data;
    }
    await this.init();
    const value = await this.db?.get('store', url);
    return value?.data;
  }

  async set(url: string, data: any) {
    const value = { url, data, timestamp: Date.now() };
    this.map.set(url, value);
    await this.init();
    await this.db?.put('store', value);
  }
}
