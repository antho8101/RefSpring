
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initProductionOptimizations } from './utils/productionOptimizer.ts'
import { initSecurityHardening } from './utils/securityHardening.ts'
import { initPerformanceMonitoring } from './utils/performanceMonitor.ts'
import Logger from './utils/logger.ts'

// Initialiser toutes les optimisations critiques
initProductionOptimizations();
initSecurityHardening();
initPerformanceMonitoring();

Logger.info('RefSpring application starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
