
import React, { useState, useMemo } from 'react';
import type { TestRun } from '../types';
import { Status, Platform, Browser } from '../types';
import { MOCK_TEST_RUNS } from '../constants';
import { WindowsIcon, AppleIcon, UbuntuIcon } from '../constants';

interface DashboardProps {
  onSelectRun: (run: TestRun) => void;
}

const statusStyles = {
  [Status.Passed]: 'bg-status-pass/20 text-status-pass',
  [Status.Failed]: 'bg-status-fail/20 text-status-fail',
  [Status.Running]: 'bg-status-running/20 text-status-running animate-pulse',
  [Status.Queued]: 'bg-gray-500/20 text-gray-400',
};

const PlatformIcon: React.FC<{ platform: Platform }> = ({ platform }) => {
    switch (platform) {
        case Platform.Windows:
            return <WindowsIcon className="h-5 w-5" />;
        case Platform.MacOS:
            return <AppleIcon className="h-5 w-5" />;
        case Platform.Ubuntu:
            return <UbuntuIcon className="h-5 w-5" />;
        default:
            return null;
    }
};


const Dashboard: React.FC<DashboardProps> = ({ onSelectRun }) => {
  const [filter, setFilter] = useState<string>('');

  const stats = useMemo(() => {
    const total = MOCK_TEST_RUNS.length;
    const passed = MOCK_TEST_RUNS.filter(r => r.status === Status.Passed).length;
    const failed = MOCK_TEST_RUNS.filter(r => r.status === Status.Failed).length;
    const running = MOCK_TEST_RUNS.filter(r => r.status === Status.Running).length;
    return { total, passed, failed, running };
  }, []);

  const filteredRuns = useMemo(() => {
    if (!filter) return MOCK_TEST_RUNS;
    return MOCK_TEST_RUNS.filter(run =>
      run.name.toLowerCase().includes(filter.toLowerCase()) ||
      run.id.toLowerCase().includes(filter.toLowerCase()) ||
      run.triggeredBy.toLowerCase().includes(filter.toLowerCase())
    );
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
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search runs by name, ID, or user..."
            className="w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 text-xs text-gray-400 uppercase">
              <tr>
                <th className="p-4">Status</th>
                <th className="p-4">Test Name</th>
                <th className="p-4">Details</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Triggered By</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredRuns.map(run => (
                <tr key={run.id} className="hover:bg-gray-700/50 cursor-pointer" onClick={() => onSelectRun(run)}>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[run.status]}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-white">{run.name}</td>
                  <td className="p-4">
                      <div className="flex items-center space-x-2 text-gray-400">
                          <PlatformIcon platform={run.platform} />
                          <span>{run.browser}</span>
                          <span className="text-xs bg-gray-600 px-1.5 py-0.5 rounded">{run.executionMode}</span>
                      </div>
                  </td>
                  <td className="p-4 text-gray-400">{run.duration}</td>
                  <td className="p-4 text-gray-400">{run.triggeredBy}</td>
                  <td className="p-4 text-gray-400">{new Date(run.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
