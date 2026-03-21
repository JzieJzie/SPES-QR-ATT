import { supabase } from '../../lib/supabase/client'

export type ScanResponse = {
  event_id: string
  status: 'accepted' | 'duplicate' | 'invalid_window' | 'manual' | 'rejected'
  message: string
  event_type: 'AM_IN' | 'AM_OUT' | 'PM_IN' | 'PM_OUT' | null
  scanned_at: string
}

export const recordAttendanceScan = async (
  beneficiaryId: string,
  deviceInfo: string,
): Promise<ScanResponse> => {
  const { data, error } = await supabase.rpc('record_attendance_scan', {
    p_beneficiary_id: beneficiaryId,
    p_device_info: deviceInfo,
  })

  if (error) {
    const details = [error.message, error.details, error.hint].filter(Boolean).join(' | ')
    throw new Error(details || 'Scan failed.')
  }
  if (!data || !data[0]) {
    throw new Error('No scan result returned from server.')
  }

  return data[0] as ScanResponse
}
