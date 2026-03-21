import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { importMasterlistRows } from '../features/imports/api'
import { ImportPreviewTable } from '../features/imports/ImportPreviewTable'
import { parseAndValidateImportFile } from '../lib/utils/import-normalization'
import type { ImportRow } from '../lib/validators/import'

export const ImportMasterlistPage = () => {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<ImportRow[]>([])
  const [invalidRows, setInvalidRows] = useState<Array<{ rowNumber: number; issues: string[] }>>([])
  const [importFailures, setImportFailures] = useState<Array<{ row: number; reason: string }>>([])
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const onFileChange = async (selectedFile: File) => {
    setFile(selectedFile)
    const parsed = await parseAndValidateImportFile(selectedFile)
    setRows(parsed.validRows)
    setInvalidRows(parsed.invalidRows)
    setImportFailures([])
    setMessage('')
  }

  const runImport = async () => {
    if (!file || rows.length === 0) return
    setIsImporting(true)
    setMessage('')
    setImportFailures([])
    try {
      const summary = await importMasterlistRows(file.name, file.type || 'application/octet-stream', rows)
      setImportFailures(summary.failures)
      setMessage(
        `Import completed. Success: ${summary.successRows}, Failed: ${summary.failedRows}, Total: ${summary.totalRows}`,
      )
      await queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import failed.')
    } finally {
      setIsImporting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <Card title="Import Masterlist" className="space-y-2 md:space-y-3">
        <div className="space-y-2 border-2 border-black bg-white p-2 md:p-3">
          <label className="block text-xs font-mono uppercase">Choose File (CSV or XLSX)</label>
          <input
            type="file"
            accept=".csv,.xlsx"
            className="block w-full border-2 border-black bg-white p-2 text-xs md:text-sm"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0]
              if (selectedFile) {
                void onFileChange(selectedFile)
              }
            }}
          />
          <p className="text-xs font-mono">{file ? `Selected: ${file.name}` : 'No file selected yet.'}</p>
        </div>

        <Button
          size="md"
          onClick={() => setConfirmOpen(true)}
          disabled={!file || isImporting || rows.length === 0}
        >
          Review and Confirm Import
        </Button>
        {message ? <p className="text-xs md:text-sm font-semibold break-words">{message}</p> : null}
        {importFailures.length > 0 ? (
          <div className="border-2 border-black bg-white p-2 text-xs overflow-auto max-h-48">
            <p className="mb-1 font-mono uppercase">Import failure details</p>
            {importFailures.slice(0, 10).map((failure) => (
              <p key={`${failure.row}-${failure.reason}`}>Row {failure.row}: {failure.reason}</p>
            ))}
          </div>
        ) : null}
      </Card>

      <ImportPreviewTable rows={rows} invalidRows={invalidRows} />

      <Modal open={confirmOpen} title="Confirm Import" onClose={() => setConfirmOpen(false)}>
        <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
          <p>
            File: <span className="font-mono break-all">{file?.name ?? 'N/A'}</span>
          </p>
          <p>Valid rows to import: {rows.length}</p>
          <p>Invalid rows (will be skipped): {invalidRows.length}</p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => void runImport()} disabled={isImporting || rows.length === 0} size="md">
              {isImporting ? 'Importing...' : 'Confirm Import'}
            </Button>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isImporting} size="md">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
