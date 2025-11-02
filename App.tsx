import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AIAgents from './components/AIAgents';
import RunDetailModal from './components/RunDetailModal';
import type { TestRun } from './types';
import Sidebar from './components/Sidebar';
import { LogoIcon, DashboardIcon, AiIcon } from './constants';

type View = 'dashboard' | 'ai-agents' | 'runs' | 'settings';

const App: React.FC = () => {
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
      case 'runs':
        return <Dashboard onSelectRun={handleSelectRun} />; // reuse dashboard for now
      default:
        return <Dashboard onSelectRun={handleSelectRun} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans" data-theme="dark">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onNavigate={(v) => setCurrentView(v as View)} />

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
