import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import './index.css'
import './styles/responsive.css'
import App from './App.tsx'

// Import debug utilities
import './utils/envDebug'
import './utils/fcmDebug'
import './utils/vapidValidator'
import './utils/fcmFlowTest'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
