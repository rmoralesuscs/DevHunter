declare module 'dexie' {
  export type Table<T, K> = {
    count: () => Promise<number>;
    bulkPut: (items: T[]) => Promise<void>;
    put: (item: T) => Promise<void>;
    toArray?: () => Promise<T[]>;
    where?: (index: string) => any;
    orderBy?: (index: string) => any;
    filter?: (fn: (r: any) => boolean) => any;
  };

  export default class Dexie {
    constructor(name?: string);
    version(n: number): { stores: (schema: Record<string, string>) => void };
  }
}

