export type Fetcher = (url: string) => Promise<any>;

export interface Store {
  get: (url: string) => Promise<any>;
  set: (url: string, data: any) => Promise<void>;
  has: (url: string) => Promise<boolean>;
}

export interface StoreEntry {
  url: string;
  data: any;
  timestamp: number;
}
