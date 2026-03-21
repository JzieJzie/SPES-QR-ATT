import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'

import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

type ScannerPanelProps = {
  onDecoded: (decodedText: string) => Promise<void>
  onError?: (message: string) => void
}

const scannerRegionId = 'spes-scanner-region'

const toFriendlyCameraError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  if (!window.isSecureContext) {
    return 'Camera requires HTTPS on mobile. Open the app using a secure URL or localhost.'
  }

  if (normalized.includes('notallowederror') || normalized.includes('permission')) {
    return 'Camera permission was denied. Allow camera access in browser settings and retry.'
  }

  if (normalized.includes('notfounderror') || normalized.includes('no camera')) {
    return 'No camera device was found on this phone/browser.'
  }

  if (normalized.includes('notreadableerror')) {
    return 'Camera is already in use by another app. Close it and try again.'
  }

  return `Unable to start camera: ${message}`
}

export const ScannerPanel = ({ onDecoded, onError }: ScannerPanelProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(scannerRegionId)
    return () => {
      const scanner = scannerRef.current
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        void scanner.stop()
      }
      scannerRef.current = null
    }
  }, [])

  const stopScanner = async () => {
    const scanner = scannerRef.current
    if (!scanner) return
    if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
      await scanner.stop()
    }
    setIsActive(false)
  }

  const startScanner = async () => {
    const scanner = scannerRef.current
    if (!scanner || isActive || isBusy) return

    setIsActive(true)
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 20, qrbox: 260, aspectRatio: 1.333 },
        async (decodedText) => {
          if (isBusy) return
          setIsBusy(true)
          try {
            await onDecoded(decodedText)
            await stopScanner()
          } finally {
            setIsBusy(false)
          }
        },
        () => {
          // Ignore per-frame decode failures.
        },
      )
    } catch (error) {
      setIsActive(false)
      onError?.(toFriendlyCameraError(error))
    }
  }

  return (
    <Card title="Scanner Panel" className="space-y-3 md:space-y-4">
      <div id={scannerRegionId} className="min-h-64 md:min-h-72 border-2 border-black" />
      <div className="flex flex-wrap gap-2">
        <Button size="md" className="flex-1 md:flex-none md:w-auto" onClick={() => void startScanner()}>
          Scan
        </Button>
        <Button variant="outline" className="flex-1 md:flex-none md:w-auto" onClick={() => void stopScanner()}>
          Stop
        </Button>
      </div>
      <p className="text-xs font-mono">
        Camera stays off until you press Scan. It stops automatically after a successful read.
      </p>
    </Card>
  )
}
