import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  // instead of throwing, render a visible error node so devs see the problem in the page
  const body = document.body || document.getElementsByTagName('body')[0];
  const el = document.createElement('div');
  el.style.background = '#7f1d1d';
  el.style.color = 'white';
  el.style.padding = '16px';
  el.style.fontFamily = 'monospace';
  el.textContent = 'Could not find root element to mount to. Check index.html for <div id="root"></div>';
  body.appendChild(el);
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    // Render a visible error overlay instead of leaving a blank page
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.color = 'white';
    overlay.style.padding = '20px';
    overlay.style.zIndex = '99999';
    overlay.style.overflow = 'auto';
    overlay.innerText = 'Application failed to render: ' + (err && (err as any).message ? (err as any).message : String(err));
    document.body.appendChild(overlay);
    console.error('App render error:', err);
  }
}
