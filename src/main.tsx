import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import './index.css'
import { AppProviders } from './app/providers'
import { App } from './app/App'

const GlobalHotkeys = () => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        window.location.href = '/dev/developer.html'
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <GlobalHotkeys />
      <App />
    </AppProviders>
  </StrictMode>,
)
