import { useMemo, useState } from 'react'

import { Card } from '../components/ui/Card'
import { AttendanceResultCard } from '../features/scanner/AttendanceResultCard'
import { ScannerPanel } from '../features/scanner/ScannerPanel'
import { recordAttendanceScan, type ScanResponse } from '../features/scanner/api'

export const ScannerPage = () => {
  const [result, setResult] = useState<ScanResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const isSecureForCamera = window.isSecureContext

  const deviceInfo = useMemo(
    () => `ua=${navigator.userAgent};platform=${navigator.platform};lang=${navigator.language}`,
    [],
  )

  return (
    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
      <ScannerPanel
        onDecoded={async (decodedText) => {
          setErrorMessage('')
          try {
            const scan = await recordAttendanceScan(decodedText.trim(), deviceInfo)
            setResult(scan)
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Scan failed.')
          }
        }}
        onError={(message) => setErrorMessage(message)}
      />
      <div className="space-y-4">
        {!isSecureForCamera ? (
          <Card title="Camera Requirement">
            <p className="text-sm">
              Mobile browsers require HTTPS for camera access. If you opened this app via local IP over
              HTTP, scanning will fail.
            </p>
          </Card>
        ) : null}
        <AttendanceResultCard result={result} />
        {errorMessage ? (
          <Card title="Scanner Error">
            <p className="text-sm">{errorMessage}</p>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
