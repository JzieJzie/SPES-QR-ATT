import { supabase } from '../../lib/supabase/client'

export type DailyAttendanceView = {
  id: string
  attendance_date: string
  am_time_in: string | null
  am_time_out: string | null
  pm_time_in: string | null
  pm_time_out: string | null
  am_time_in_late: boolean
  am_time_out_early: boolean
  pm_time_in_late: boolean
  pm_time_out_early: boolean
  extra_am_in_count: number
  extra_am_out_count: number
  extra_pm_in_count: number
  extra_pm_out_count: number
  beneficiaries: {
    beneficiary_id: string
    first_name: string
    last_name: string
    middle_name: string | null
    barangays: {
      name: string
    }
  }
}

export const fetchDailyAttendance = async (attendanceDate: string): Promise<DailyAttendanceView[]> => {
  const { data, error } = await supabase
    .from('attendance_daily')
    .select(
      `
      *,
      beneficiaries:beneficiary_ref (
        beneficiary_id,
        first_name,
        last_name,
        middle_name,
        barangays:barangay_id (name)
      )
    `,
    )
    .eq('attendance_date', attendanceDate)
    .order('beneficiary_ref')

  if (error) throw error
  return (data ?? []) as DailyAttendanceView[]
}
