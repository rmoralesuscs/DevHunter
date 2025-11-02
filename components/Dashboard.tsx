import React, { useState, useEffect } from 'react';
import type { TestRun } from '../types';
import { Status, Platform } from '../types';
import { MOCK_TEST_RUNS } from '../constants';
import RunsTable from './RunsTable';
import { db, addRunsBulk, countRunsByStatus, queryRuns } from '../services/db';

interface DashboardProps {
  onSelectRun: (run: TestRun) => void;
}


const Dashboard: React.FC<DashboardProps> = ({ onSelectRun }) => {
  const [filter, setFilter] = useState<string>('');
  const [runs, setRuns] = useState<TestRun[]>(MOCK_TEST_RUNS);
  const [stats, setStats] = useState({ total: 0, passed: 0, failed: 0, running: 0 });

  // Seed DB (first load) with mock runs if empty
  useEffect(() => {
    (async () => {
      const total = await db.runs.count();
      if (total === 0) {
        await addRunsBulk(MOCK_TEST_RUNS);
      }
      // refresh
      refreshLocalData();
    })();
  }, []);

  const refreshLocalData = async () => {
    const all = await queryRuns();
    setRuns(all as TestRun[]);
    const total = await countRunsByStatus();
    const passed = await countRunsByStatus(Status.Passed);
    const failed = await countRunsByStatus(Status.Failed);
    const running = await countRunsByStatus(Status.Running);
    setStats({ total, passed, failed, running });
  };

  // Search handler: local filter + when online, hit /runs?q=
  useEffect(() => {
    let cancelled = false;
    const doSearch = async () => {
      if (!filter) {
        await refreshLocalData();
        return;
      }
      // First search local DB
      const local = await queryRuns(filter);
      if (!cancelled) setRuns(local as TestRun[]);

      // If online, also query server endpoint to refresh results
      if (navigator.onLine) {
        try {
          const res = await fetch(`/runs?q=${encodeURIComponent(filter)}`);
          if (res.ok) {
            const remote: TestRun[] = await res.json();
            // Merge remote into local DB for offline availability
            await addRunsBulk(remote);
            if (!cancelled) setRuns(remote);
          }
        } catch (e) {
          // ignore network errors — we still have local results
          console.warn('Remote runs query failed', e);
        }
      }
    };
    doSearch();
    return () => { cancelled = true; };
  }, [filter]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Total Runs</h3>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Passed</h3>
            <p className="text-3xl font-bold text-status-pass">{stats.passed}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Failed</h3>
            <p className="text-3xl font-bold text-status-fail">{stats.failed}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Running</h3>
            <p className="text-3xl font-bold text-status-running">{stats.running}</p>
        </div>
      </div>

      {/* Test Runs List */}
      <div className="mb-6">
        <label htmlFor="global-search" className="sr-only">Search runs globally</label>
        <input
          id="global-search"
          type="text"
          placeholder="Search runs by name, ID, or user..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Search runs"
        />
      </div>

      <RunsTable runs={runs} onSelectRun={onSelectRun} />
    </div>
  );
};

export default Dashboard;
