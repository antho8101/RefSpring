
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cleanProductionLogs } from './utils/productionLogCleaner'
import { applyEnhancedCSP } from './utils/enhancedCSP'
import { securityMonitor } from './utils/securityMonitor'

console.log('🚀 Application en cours de démarrage...');

// Initialize security measures
cleanProductionLogs();
applyEnhancedCSP();

// Initialize security monitoring
securityMonitor.onAlert((alert) => {
  if (alert.level === 'CRITICAL' || alert.level === 'HIGH') {
    console.warn('🚨 SECURITY ALERT:', alert);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
