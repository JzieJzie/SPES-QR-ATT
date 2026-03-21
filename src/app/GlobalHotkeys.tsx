import { useEffect } from 'react'

export const GlobalHotkeys = () => {
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

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [])

  return null
}
