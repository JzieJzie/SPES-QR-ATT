export type AppRole = 'admin' | 'scanner'

export type EventType = 'AM_IN' | 'AM_OUT' | 'PM_IN' | 'PM_OUT'
export type SessionName = 'MORNING' | 'AFTERNOON'
export type AttendanceStatus =
  | 'accepted'
  | 'duplicate'
  | 'invalid_window'
  | 'manual'
  | 'rejected'

export type Profile = {
  id: string
  full_name: string | null
  role: AppRole
  created_at: string
  updated_at: string
}

export type Barangay = {
  id: string
  name: string
  created_at: string
}

export type Beneficiary = {
  id: string
  beneficiary_id: string
  last_name: string
  first_name: string
  middle_name: string | null
  barangay_id: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export type BeneficiaryQrCode = {
  id: string
  beneficiary_ref: string
  qr_value: string
  qr_image_path: string
  generated_at: string
}

export type AttendanceEvent = {
  id: string
  beneficiary_ref: string
  attendance_date: string
  scanned_at: string
  event_type: EventType | null
  session_name: SessionName | null
  is_late: boolean
  is_early_out: boolean
  is_extra_punch: boolean
  punch_sequence: number
  remarks: string | null
  scanned_by: string | null
  device_info: string | null
  status: AttendanceStatus
  created_at: string
}

export type AttendanceDaily = {
  id: string
  beneficiary_ref: string
  attendance_date: string
  am_time_in: string | null
  am_time_in_late: boolean
  am_time_out: string | null
  am_time_out_early: boolean
  pm_time_in: string | null
  pm_time_in_late: boolean
  pm_time_out: string | null
  pm_time_out_early: boolean
  extra_am_in_count: number
  extra_am_out_count: number
  extra_pm_in_count: number
  extra_pm_out_count: number
  remarks: string | null
  updated_at: string
}

export type ImportRecord = {
  id: string
  file_name: string
  file_type: string
  total_rows: number
  success_rows: number
  failed_rows: number
  imported_by: string | null
  imported_at: string
}

export type AuditLog = {
  id: string
  actor_user_id: string | null
  action: string
  entity_name: string
  entity_id: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: string
}
