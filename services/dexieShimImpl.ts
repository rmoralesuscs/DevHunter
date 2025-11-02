// Minimal in-memory shim that mimics the tiny API surface we use from Dexie.
export type Table<T, K> = {
  count: () => Promise<number>;
  bulkPut: (items: T[]) => Promise<void>;
  put: (item: T) => Promise<void>;
  toArray: () => Promise<T[]>;
  where?: (index: string) => any;
  orderBy?: (index: string) => any;
  filter?: (fn: (r: any) => boolean) => any;
};

type StoreMap = Map<any, any>;

export default class Dexie {
  name: string;
  private _stores: Record<string, StoreMap> = {};

  constructor(name?: string) {
    this.name = name || 'in-memory-db';
  }

  version(_: number) {
    return {
      stores: (schema: Record<string, string>) => {
        Object.keys(schema).forEach(storeName => {
          if (!this._stores[storeName]) this._stores[storeName] = new Map();
        });
      }
    };
  }

  // Helper to create a table facade
  _table<T>(name: string): Table<T, any> {
    const map = this._stores[name] || new Map();
    this._stores[name] = map;

    return {
      count: async () => map.size,
      bulkPut: async (items: any[]) => {
        for (const it of items) {
          map.set(it.id ?? JSON.stringify(it), it);
        }
      },
      put: async (item: any) => {
        map.set(item.id ?? JSON.stringify(item), item);
      },
      toArray: async () => Array.from(map.values()),
      where: (index: string) => {
        return {
          equals: (val: any) => ({
            count: async () => Array.from(map.values()).filter((r:any) => r[index] === val).length,
            toArray: async () => Array.from(map.values()).filter((r:any) => r[index] === val),
          })
        };
      },
      orderBy: (index: string) => ({
        reverse: () => ({
          toArray: async () => Array.from(map.values()).sort((a:any,b:any) => (a[index] > b[index] ? 1 : -1)).reverse()
        })
      }),
      filter: (fn: (r: any) => boolean) => ({
        toArray: async () => Array.from(map.values()).filter(fn)
      })
    };
  }
}

