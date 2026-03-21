import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProviders } from './app/providers'
import { App } from './app/App'
import { GlobalHotkeys } from './app/GlobalHotkeys'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <GlobalHotkeys />
      <App />
    </AppProviders>
  </StrictMode>,
)
