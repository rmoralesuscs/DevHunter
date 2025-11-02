// File: `src/index.tsx`
import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('[dev] /Users/rmorales/WebStormProjects/dev-hunter-01/index.tsx loaded');

const root = document.getElementById('root');
if (!root) {
  console.error('[dev] root element `#root` not found. Check `index.html` contains `<div id="root"></div>`');
} else {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}