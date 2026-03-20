import QRCode from 'qrcode'

import { supabase } from '../../lib/supabase/client'
import type { ImportRow } from '../../lib/validators/import'

const QR_BUCKET = 'qr-codes'

type ImportSummary = {
  totalRows: number
  successRows: number
  failedRows: number
  failures: Array<{ row: number; reason: string }>
}

const summarizeFailure = (message: string): string => {
  const normalized = message.toLowerCase()

  if (normalized.includes('row-level security') || normalized.includes('permission denied')) {
    return 'Import blocked by database permissions. Ensure your account has admin role in profiles.'
  }

  if (normalized.includes('relation') && normalized.includes('does not exist')) {
    return 'Database setup is incomplete. Run the Supabase migration SQL for this project.'
  }

  return message
}

const toPngBlob = async (value: string): Promise<Blob> => {
  const dataUrl = await QRCode.toDataURL(value, {
    color: { dark: '#000000', light: '#ffffff' },
    margin: 1,
    width: 480,
  })
  const binary = atob(dataUrl.split(',')[1])
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new Blob([bytes], { type: 'image/png' })
}

const getOrCreateBarangayId = async (name: string): Promise<string> => {
  const normalized = name.trim().toUpperCase()
  const { data: existing } = await supabase
    .from('barangays')
    .select('id')
    .eq('name', normalized)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data, error } = await supabase
    .from('barangays')
    .insert({ name: normalized })
    .select('id')
    .single()

  if (error || !data) {
    throw error ?? new Error('Failed to create barangay')
  }

  return data.id
}

export const importMasterlistRows = async (
  fileName: string,
  fileType: string,
  rows: ImportRow[],
): Promise<ImportSummary> => {
  let successRows = 0
  const failures: Array<{ row: number; reason: string }> = []

  for (const [index, row] of rows.entries()) {
    try {
      const barangayId = await getOrCreateBarangayId(row.Barangay)

      const { data: beneficiary, error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .insert({
          last_name: row.lastName.trim().toUpperCase(),
          first_name: row.firstName.trim().toUpperCase(),
          middle_name: row.middleName.trim().toUpperCase() || null,
          barangay_id: barangayId,
        })
        .select('id, beneficiary_id')
        .single()

      if (beneficiaryError || !beneficiary) {
        throw beneficiaryError ?? new Error('Failed to create beneficiary')
      }

      const qrBlob = await toPngBlob(beneficiary.beneficiary_id)
      const qrPath = `${beneficiary.beneficiary_id}.png`

      const { error: uploadError } = await supabase.storage
        .from(QR_BUCKET)
        .upload(qrPath, qrBlob, { upsert: true, contentType: 'image/png' })

      if (uploadError) throw uploadError

      const { error: qrError } = await supabase.from('beneficiary_qr_codes').insert({
        beneficiary_ref: beneficiary.id,
        qr_value: beneficiary.beneficiary_id,
        qr_image_path: qrPath,
      })

      if (qrError) throw qrError

      successRows += 1
    } catch (error) {
      const reason = summarizeFailure(
        error instanceof Error ? error.message : 'Unknown import error',
      )
      failures.push({ row: index + 1, reason })
    }
  }

  const failedRows = failures.length

  const { error: importLogError } = await supabase.from('imports').insert({
    file_name: fileName,
    file_type: fileType,
    total_rows: rows.length,
    success_rows: successRows,
    failed_rows: failedRows,
  })

  if (importLogError) {
    const reason = summarizeFailure(importLogError.message)
    throw new Error(`Unable to save import log. ${reason}`)
  }

  if (successRows === 0 && failedRows > 0) {
    const firstThreeReasons = failures
      .slice(0, 3)
      .map((failure) => `row ${failure.row}: ${failure.reason}`)
      .join(' | ')

    throw new Error(`No rows were imported. ${firstThreeReasons}`)
  }

  return {
    totalRows: rows.length,
    successRows,
    failedRows,
    failures,
  }
}
