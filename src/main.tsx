import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import './index.css'
import { AppProviders } from './app/providers'
import { App } from './app/App'

const GlobalHotkeys = () => {
  useEffect(() => {
    const openDeveloperPage = () => {
      window.location.assign('/dev/developer.html')
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const isPrimaryShortcut = event.ctrlKey && event.shiftKey && event.code === 'KeyA'
      const isFallbackShortcut = event.ctrlKey && event.altKey && event.code === 'KeyA'

      if (isPrimaryShortcut || isFallbackShortcut) {
        event.preventDefault()
        openDeveloperPage()
      }
    }

    // Use capture so we receive the event as early as the browser allows.
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
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
