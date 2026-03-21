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
    return 'Import blocked by database permissions. Ensure your account has leader or developer role in profiles.'
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

const getOrCreateBeneficiary = async (
  row: ImportRow,
  barangayId: string,
): Promise<{ id: string; beneficiary_id: string }> => {
  const normalizedLastName = row.lastName.trim().toUpperCase()
  const normalizedFirstName = row.firstName.trim().toUpperCase()
  const normalizedMiddleName = row.middleName.trim().toUpperCase() || null

  let existingQuery = supabase
    .from('beneficiaries')
    .select('id, beneficiary_id')
    .eq('last_name', normalizedLastName)
    .eq('first_name', normalizedFirstName)
    .eq('barangay_id', barangayId)

  if (normalizedMiddleName) {
    existingQuery = existingQuery.eq('middle_name', normalizedMiddleName)
  } else {
    existingQuery = existingQuery.is('middle_name', null)
  }

  const { data: existing, error: existingError } = await existingQuery.maybeSingle()

  if (existingError) throw existingError
  if (existing) {
    const { error: restoreError } = await supabase
      .from('beneficiaries')
      .update({ is_archived: false })
      .eq('id', existing.id)

    if (restoreError) throw restoreError
    return existing
  }

  const { data: created, error: createError } = await supabase
    .from('beneficiaries')
    .insert({
      last_name: normalizedLastName,
      first_name: normalizedFirstName,
      middle_name: normalizedMiddleName,
      barangay_id: barangayId,
    })
    .select('id, beneficiary_id')
    .single()

  if (createError || !created) {
    throw createError ?? new Error('Failed to create beneficiary')
  }

  return created
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
      const beneficiary = await getOrCreateBeneficiary(row, barangayId)

      const qrBlob = await toPngBlob(beneficiary.beneficiary_id)
      const qrPath = `${beneficiary.beneficiary_id}.png`

      const { error: uploadError } = await supabase.storage
        .from(QR_BUCKET)
        .upload(qrPath, qrBlob, { upsert: true, contentType: 'image/png' })

      if (uploadError) throw uploadError

      const { error: qrError } = await supabase.from('beneficiary_qr_codes').upsert(
        {
          beneficiary_ref: beneficiary.id,
          qr_value: beneficiary.beneficiary_id,
          qr_image_path: qrPath,
        },
        {
          onConflict: 'beneficiary_ref',
        },
      )

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
