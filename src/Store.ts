export interface Store {
  get: (url: string) => Promise<any>;
  set: (url: string, data: any) => Promise<void>;
  remove: (url: string) => Promise<void>;
}
