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

  dbName = 'react_fast_fetch';
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

  error(...args: any[]) {
    console.error(PACKAGE_NAME, 'IndexedDB', ...args);
  }

  async init() {
    if (this.db) {
      return;
    }
    try {
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
    } catch (e) {
      this.error('Failed to init IndexedDB', e);
    }
  }

  async has(url: string) {
    if (this.map.has(url)) {
      return true;
    }
    try {
      await this.init();
      const value = await this.db?.get('store', url);
      if (value) {
        this.map.set(url, value); // cache in memory
        return true;
      } else {
        return false;
      }
    } catch (e) {
      this.error('Failed to read IndexedDB', e);
      return false;
    }
  }

  async get(url: string) {
    const memoryValue = this.map.get(url);
    if (memoryValue) {
      return memoryValue.data;
    }
    try {
      await this.init();
      const value = await this.db?.get('store', url);
      if (value) {
        this.map.set(url, value); // cache in memory
      }
      return value?.data;
    } catch (e) {
      this.error('Failed to read IndexedDB', e);
    }
  }

  async set(url: string, data: any) {
    const value = { url, data, timestamp: Date.now() };
    this.map.set(url, value); // cache in memory
    try {
      await this.init();
      await this.db?.put('store', value);
    } catch (e) {
      this.error('Failed to write IndexedDB', e);
    }
  }

  async clean() {
    const count = (await this.db?.count('store')) || 0;
    const deleteCount = count - this.limit;
    if (deleteCount > 0) {
      const store = this.db?.transaction('store', 'readwrite').objectStore('store');
      const index = store?.index('timestamp');
      const cursor = await index?.openCursor();
      for (let i = 0; i < deleteCount; i++) {
        await cursor?.delete();
        await cursor?.continue();
      }
    }
  }
}
