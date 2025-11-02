import React from 'react';
import type { TestRun } from '../types';
import { Status, Platform } from '../types';
import { WindowsIcon, AppleIcon, UbuntuIcon } from '../constants';

interface RunsTableProps {
  runs: TestRun[];
  onSelectRun: (run: TestRun) => void;
}

const statusStyles: Record<string, string> = {
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

const formatDuration = (d: string) => {
  // If duration already human-friendly, return as-is.
  if (!d) return '-';
  if (d.includes('In Progress')) return 'In Progress';
  return d;
};

const RunsTable: React.FC<RunsTableProps> = ({ runs, onSelectRun }) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Table header */}
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
            {runs.map(run => (
              <tr key={run.id} className="hover:bg-gray-700/50 cursor-pointer" onClick={() => onSelectRun(run)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onSelectRun(run); }}>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[run.status]}`} aria-label={`Status ${run.status}`}>
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
                <td className="p-4 text-gray-400">{formatDuration(run.duration)}</td>
                <td className="p-4 text-gray-400">{run.triggeredBy}</td>
                <td className="p-4 text-gray-400">{new Date(run.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RunsTable;
