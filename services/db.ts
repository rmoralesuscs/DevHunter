import type { TestRun } from '../types';

// Use real Dexie if available, otherwise use local shim to allow offline typechecks/tests
let DexieClass: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  DexieClass = require('dexie').default;
} catch (e) {
  DexieClass = require('./dexieShimImpl').default;
}

import type { Table } from './dexieShimImpl';

export interface TestEntity {
  id: string;
  name: string;
  status: string;
  platform: string;
  browser: string;
  duration: string;
  timestamp: string;
  commit?: string;
  triggeredBy?: string;
  executionMode?: string;
  videoUrl?: string;
  screenshots?: { name: string; url: string }[];
  logs?: { level: string; message: string; timestamp: string }[];
}

export interface SuiteEntity {
  id: string;
  name: string;
  tests: string[]; // list of test ids
}

export interface RunEntity extends TestEntity {}

export interface OutboundQueueItem {
  id?: number;
  type: string;
  payload: any;
  createdAt: string;
}

class AppDB extends DexieClass {
  tests!: Table<TestEntity, string>;
  suites!: Table<SuiteEntity, string>;
  runs!: Table<RunEntity, string>;
  outboundQueue!: Table<OutboundQueueItem, number>;

  constructor() {
    super('AuraTestDB');
    // version/stores API exists on both real Dexie and shim
    (this as any).version(1).stores({
      tests: 'id, name, [name+status], status, timestamp, triggeredBy',
      suites: 'id, name',
      runs: 'id, name, status, timestamp, triggeredBy, platform, browser',
      outboundQueue: '++id, type, createdAt'
    });

    // Map shim tables to properties for convenience
    if (!(this as any).tests && (this as any)._table) {
      (this as any).tests = (this as any)._table('tests');
      (this as any).suites = (this as any)._table('suites');
      (this as any).runs = (this as any)._table('runs');
      (this as any).outboundQueue = (this as any)._table('outboundQueue');
    }
  }
}

export const db = new AppDB();

// Convenience helpers
export const addRunsBulk = async (runs: TestRun[]) => {
  const items = runs.map(r => ({ ...r }));
  await (db as any).runs.bulkPut(items);
};

export const countRunsByStatus = async (status?: string) => {
  if (!status) return await (db as any).runs.count();
  return await (db as any).runs.where('status').equals(status).count();
};

export const queryRuns = async (q?: string) => {
  if (!q) return await (db as any).runs.orderBy('timestamp').reverse().toArray();
  const lower = q.toLowerCase();
  return await (db as any).runs.filter((r: any) =>
    (r.name || '').toLowerCase().includes(lower) ||
    (r.id || '').toLowerCase().includes(lower) ||
    ((r.triggeredBy || '').toLowerCase().includes(lower))
  ).toArray();
};
