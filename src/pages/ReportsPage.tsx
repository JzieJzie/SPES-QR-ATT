import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { fetchDailyAttendance } from '../features/attendance/api'
import { fetchBeneficiaries } from '../features/beneficiaries/api'
import { exportDailyReportXlsx, exportMasterlistXlsx } from '../lib/utils/export-formatting'
import { toManilaDate } from '../lib/utils/time'
import { supabase } from '../lib/supabase/client'

export const ReportsPage = () => {
  const [date, setDate] = useState(toManilaDate(new Date()))
  const [isExporting, setIsExporting] = useState(false)

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
    setIsExporting(true)
    try {
      const rows = await Promise.all(
        beneficiariesQuery.data.map(async (beneficiary) => {
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

          return {
            beneficiaryID: beneficiary.beneficiary_id,
            lastName: beneficiary.last_name,
            firstName: beneficiary.first_name,
            middleName: beneficiary.middle_name ?? '',
            barangay: beneficiary.barangays.name,
            qrImageUrl,
            qrDownloadUrl,
          }
        }),
      )

      await exportMasterlistXlsx(rows)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card title="Reports" className="space-y-4">
      <label className="grid max-w-xs gap-1 text-sm">
        Attendance Date
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void exportDaily()} disabled={isExporting || dailyRows.length === 0}>
          Export Daily XLSX
        </Button>
        <Button
          variant="outline"
          onClick={() => void exportMasterlist()}
          disabled={isExporting || !beneficiariesQuery.data?.length}
        >
          Export Masterlist XLSX
        </Button>
      </div>
      <p className="text-xs font-mono">
        Daily report includes exact timestamps with seconds using Asia/Manila timezone.
      </p>
    </Card>
  )
}
