import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './../design/index.css';
import './dashboard.css';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Root container #root was not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
