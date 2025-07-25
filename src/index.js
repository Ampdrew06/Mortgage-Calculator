import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// ✅ Register the service worker for PWA offline support
serviceWorkerRegistration.register();
