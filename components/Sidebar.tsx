import React from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'runs', label: 'Runs' },
  { id: 'settings', label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="w-64 bg-gray-800 border-r border-gray-700 p-5 flex flex-col justify-between" aria-label="Main sidebar">
      <div>
        <div className="flex items-center space-x-3 mb-10">
          <div className="h-10 w-10 bg-brand-primary rounded flex items-center justify-center text-white font-bold">AT</div>
          <span className="text-2xl font-bold text-white">AuraTest AI</span>
        </div>
        <ul role="menu">
          {navItems.map(item => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate(item.id); }}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                currentView === item.id ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate(item.id)}
              aria-current={currentView === item.id}
            >
              <span className="font-semibold">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>&copy; 2024 AuraTest Inc.</p>
        <p>Enterprise Testing Platform</p>
      </div>
    </nav>
  );
};

export default Sidebar;

