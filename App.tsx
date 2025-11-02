import React, { useState } from 'react';
console.log('[dev] App.tsx module loaded');
import Dashboard from './components/Dashboard';
import AIAgents from './components/AIAgents';
import RunDetailModal from './components/RunDetailModal';
import type { TestRun } from './types';
import { LogoIcon, DashboardIcon, AiIcon } from './constants';

type View = 'dashboard' | 'ai-agents';

const App: React.FC = () => {
  console.log('[dev] App component render start');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);

  const handleSelectRun = (run: TestRun) => {
    setSelectedRun(run);
  };

  const handleCloseModal = () => {
    setSelectedRun(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onSelectRun={handleSelectRun} />;
      case 'ai-agents':
        return <AIAgents />;
      default:
        return <Dashboard onSelectRun={handleSelectRun} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-gray-800 border-r border-gray-700 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <LogoIcon className="h-10 w-10 text-brand-primary" />
            <span className="text-2xl font-bold text-white">AuraTest AI</span>
          </div>
          <ul>
            <li
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                currentView === 'dashboard' ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-700'
              }`}
              onClick={() => setCurrentView('dashboard')}
            >
              <DashboardIcon className="h-6 w-6" />
              <span className="font-semibold">Dashboard</span>
            </li>
            <li
              className={`flex items-center space-x-3 p-3 mt-2 rounded-lg cursor-pointer transition-all duration-200 ${
                currentView === 'ai-agents' ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-700'
              }`}
              onClick={() => setCurrentView('ai-agents')}
            >
              <AiIcon className="h-6 w-6" />
              <span className="font-semibold">AI Agents</span>
            </li>
          </ul>
        </div>
        <div className="text-center text-xs text-gray-500">
            <p>&copy; 2024 AuraTest Inc.</p>
            <p>Enterprise Testing Platform</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {renderView()}
      </main>

      {/* Modal */}
      {selectedRun && <RunDetailModal run={selectedRun} onClose={handleCloseModal} />}
    </div>
  );
};

export default App;
