import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { fetchDailyAttendance } from '../features/attendance/api'
import { fetchBeneficiaries } from '../features/beneficiaries/api'
import {
  exportDailyReportXlsx,
  exportMasterlistXlsx,
  type MasterlistExportRow,
} from '../lib/utils/export-formatting'
import { toManilaDate } from '../lib/utils/time'
import { supabase } from '../lib/supabase/client'

export const ReportsPage = () => {
  const [date, setDate] = useState(toManilaDate(new Date()))
  const [isExporting, setIsExporting] = useState(false)
  const [masterlistDurationMs, setMasterlistDurationMs] = useState<number | null>(null)
  const [masterlistProgress, setMasterlistProgress] = useState({
    phase: '',
    percent: 0,
    processed: 0,
    total: 0,
  })

  const dailyQuery = useQuery({
    queryKey: ['reports-daily', date],
    queryFn: () => fetchDailyAttendance(date),
  })

  const beneficiariesQuery = useQuery({
    queryKey: ['reports-masterlist'],
    queryFn: () => fetchBeneficiaries(true),
  })

  const dailyRows = useMemo(
    () =>
      dailyQuery.data?.map((row) => ({
        beneficiaryID: row.beneficiaries.beneficiary_id,
        fullName: `${row.beneficiaries.last_name}, ${row.beneficiaries.first_name} ${row.beneficiaries.middle_name ?? ''}`.trim(),
        barangay: row.beneficiaries.barangays.name,
        amIn: row.am_time_in,
        amOut: row.am_time_out,
        pmIn: row.pm_time_in,
        pmOut: row.pm_time_out,
        remarks: [
          row.am_time_in_late ? 'Late' : null,
          row.am_time_out_early ? 'Early out' : null,
          row.pm_time_in_late ? 'Late PM' : null,
          row.pm_time_out_early ? 'Early out PM' : null,
        ]
          .filter(Boolean)
          .join(', '),
      })) ?? [],
    [dailyQuery.data],
  )

  const exportDaily = async () => {
    setIsExporting(true)
    try {
      await exportDailyReportXlsx(date, dailyRows)
    } finally {
      setIsExporting(false)
    }
  }

  const exportMasterlist = async () => {
    if (!beneficiariesQuery.data) return

    const startedAt = performance.now()
    const total = beneficiariesQuery.data.length
    setMasterlistDurationMs(null)
    setMasterlistProgress({
      phase: 'Preparing QR links',
      percent: 0,
      processed: 0,
      total,
    })

    setIsExporting(true)
    try {
      const rows: MasterlistExportRow[] = []

      for (const [index, beneficiary] of beneficiariesQuery.data.entries()) {
        const { data: qr } = await supabase
          .from('beneficiary_qr_codes')
          .select('qr_image_path')
          .eq('beneficiary_ref', beneficiary.id)
          .maybeSingle()

        let qrImageUrl = ''
        let qrDownloadUrl = ''
        if (qr?.qr_image_path) {
          const signed = await supabase.storage
            .from('qr-codes')
            .createSignedUrl(qr.qr_image_path, 60 * 60 * 24 * 7)
          qrImageUrl = signed.data?.signedUrl ?? ''
          qrDownloadUrl = signed.data?.signedUrl ?? ''
        }

        rows.push({
          beneficiaryID: beneficiary.beneficiary_id,
          lastName: beneficiary.last_name,
          firstName: beneficiary.first_name,
          middleName: beneficiary.middle_name ?? '',
          barangay: beneficiary.barangays.name,
          qrImageUrl,
          qrDownloadUrl,
        })

        const prepPercent = total === 0 ? 40 : Math.round(((index + 1) / total) * 40)
        setMasterlistProgress({
          phase: 'Preparing QR links',
          percent: prepPercent,
          processed: index + 1,
          total,
        })
      }

      await exportMasterlistXlsx(rows, ({ processed, total: exportTotal }) => {
        const exportPercent =
          exportTotal === 0 ? 100 : 40 + Math.round((processed / exportTotal) * 60)

        setMasterlistProgress({
          phase: 'Generating Excel file',
          percent: Math.min(exportPercent, 100),
          processed,
          total: exportTotal,
        })
      })

      setMasterlistProgress((current) => ({ ...current, phase: 'Completed', percent: 100 }))
      setMasterlistDurationMs(Math.round(performance.now() - startedAt))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card title="Reports" className="space-y-3 md:space-y-4">
      <label className="grid max-w-xs gap-1 text-xs md:text-sm">
        Attendance Date
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void exportDaily()} disabled={isExporting || dailyRows.length === 0} size="md">
          Export Daily XLSX
        </Button>
        <Button
          variant="outline"
          onClick={() => void exportMasterlist()}
          disabled={isExporting || !beneficiariesQuery.data?.length}
          size="md"
        >
          Export Masterlist XLSX
        </Button>
      </div>

      {(isExporting || masterlistDurationMs !== null) && (
        <div className="space-y-2 border-2 border-black bg-white p-2 md:p-3">
          <p className="text-xs md:text-sm font-semibold">Masterlist Export Progress</p>
          <div className="h-3 md:h-4 w-full border-2 border-black bg-zinc-100">
            <div
              className="h-full bg-black transition-all"
              style={{ width: `${masterlistProgress.percent}%` }}
            />
          </div>
          <p className="text-xs font-mono">
            {masterlistProgress.phase || 'Preparing...'} - {masterlistProgress.percent}%
            {masterlistProgress.total > 0
              ? ` (${masterlistProgress.processed}/${masterlistProgress.total})`
              : ''}
          </p>
          {masterlistDurationMs !== null && !isExporting && (
            <p className="text-xs font-mono">Total export time: {(masterlistDurationMs / 1000).toFixed(2)}s</p>
          )}
        </div>
      )}

      <p className="text-xs font-mono">
        Daily report includes exact timestamps with seconds using Asia/Manila timezone.
      </p>
    </Card>
  )
}
