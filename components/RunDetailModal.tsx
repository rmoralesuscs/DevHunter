
import React, { useState } from 'react';
import type { TestRun } from '../types';
import { Status } from '../types';
import { WindowsIcon, AppleIcon, UbuntuIcon } from '../constants';

interface RunDetailModalProps {
  run: TestRun;
  onClose: () => void;
}

type Tab = 'video' | 'screenshots' | 'logs';

const statusStyles = {
  [Status.Passed]: 'border-status-pass text-status-pass',
  [Status.Failed]: 'border-status-fail text-status-fail',
  [Status.Running]: 'border-status-running text-status-running',
  [Status.Queued]: 'border-gray-500 text-gray-400',
};

const logStyles = {
    'info': 'text-gray-400',
    'warn': 'text-yellow-400',
    'error': 'text-red-400',
};


const RunDetailModal: React.FC<RunDetailModalProps> = ({ run, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('video');

  const PlatformIcon = () => {
    switch (run.platform) {
        case 'Windows': return <WindowsIcon className="h-5 w-5" />;
        case 'macOS': return <AppleIcon className="h-5 w-5" />;
        case 'Ubuntu': return <UbuntuIcon className="h-5 w-5" />;
        default: return null;
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'video':
        return run.videoUrl ? (
            <div className="bg-black aspect-video rounded-lg overflow-hidden">
                <h3 className="text-lg text-white font-semibold p-4">Test Session Recording</h3>
                {/* In a real app, this would be a proper video player */}
                 <img src={run.videoUrl} alt="Video placeholder" className="w-full h-full object-cover"/>
                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                     <p className="text-white text-xl">(Video Playback Placeholder)</p>
                 </div>
            </div>
        ) : (
            <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
                <p className="text-gray-500">No video available for this run.</p>
            </div>
        );
      case 'screenshots':
        return run.screenshots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {run.screenshots.map((ss, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <img src={ss.url} alt={ss.name} className="w-full h-auto object-cover" />
                <p className="text-sm text-center p-2 text-gray-400">{ss.name}</p>
              </div>
            ))}
          </div>
        ) : (
            <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
                <p className="text-gray-500">No screenshots available for this run.</p>
            </div>
        );
      case 'logs':
        return (
          <div className="bg-gray-900 font-mono text-sm text-gray-300 rounded-lg p-4 h-96 overflow-y-auto border border-gray-700">
            {run.logs.map((log, index) => (
              <div key={index} className={`flex ${logStyles[log.level]}`}>
                <span className="mr-4 text-gray-500">{log.timestamp}</span>
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-white">{run.name}</h2>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${statusStyles[run.status]}`}>{run.status}</span>
                    <div className="flex items-center space-x-1"><PlatformIcon /> <span>{run.platform}</span></div>
                    <span>{run.browser}</span>
                    <span>{run.executionMode}</span>
                    <span>by {run.triggeredBy}</span>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 px-6">
          <button className={`py-3 px-4 font-semibold ${activeTab === 'video' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`} onClick={() => setActiveTab('video')}>Video</button>
          <button className={`py-3 px-4 font-semibold ${activeTab === 'screenshots' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`} onClick={() => setActiveTab('screenshots')}>Screenshots</button>
          <button className={`py-3 px-4 font-semibold ${activeTab === 'logs' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`} onClick={() => setActiveTab('logs')}>Logs</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default RunDetailModal;
