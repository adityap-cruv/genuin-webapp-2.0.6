// The Genuin SDK CDN loader is included in `index.html` as a non-module
// <script>, so `window.genuin` is available before this module evaluates.
// See `dev-app.tsx` for the per-mount `window.genuin.init()` call.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { DevApp } from './dev-app';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('hierarchical-tree dev surface: #root element missing from index.html');
}

createRoot(container).render(
  <StrictMode>
    <DevApp />
  </StrictMode>,
);
