
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { mockStripeBackend } from '@/services/mockStripeBackend'

// Installer le mock backend Stripe pour le développement
mockStripeBackend.install();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
