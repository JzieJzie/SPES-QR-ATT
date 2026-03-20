import type { AttendanceDaily, AttendanceEvent, EventType } from '../../types/domain'

type SlotKey =
  | 'am_time_in'
  | 'am_time_out'
  | 'pm_time_in'
  | 'pm_time_out'

const slotMap: Record<EventType, SlotKey> = {
  AM_IN: 'am_time_in',
  AM_OUT: 'am_time_out',
  PM_IN: 'pm_time_in',
  PM_OUT: 'pm_time_out',
}

export const recomputeDailyFromEvents = (
  beneficiaryRef: string,
  attendanceDate: string,
  events: AttendanceEvent[],
): Omit<AttendanceDaily, 'id' | 'updated_at'> => {
  const sorted = [...events].sort(
    (a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime(),
  )

  const summary: Omit<AttendanceDaily, 'id' | 'updated_at'> = {
    beneficiary_ref: beneficiaryRef,
    attendance_date: attendanceDate,
    am_time_in: null,
    am_time_in_late: false,
    am_time_out: null,
    am_time_out_early: false,
    pm_time_in: null,
    pm_time_in_late: false,
    pm_time_out: null,
    pm_time_out_early: false,
    extra_am_in_count: 0,
    extra_am_out_count: 0,
    extra_pm_in_count: 0,
    extra_pm_out_count: 0,
    remarks: null,
  }

  for (const event of sorted) {
    if (!event.event_type || event.status === 'invalid_window' || event.status === 'rejected') {
      continue
    }

    const slot = slotMap[event.event_type]
    const slotValue = summary[slot]

    if (!slotValue) {
      summary[slot] = event.scanned_at
      if (event.event_type === 'AM_IN') summary.am_time_in_late = event.is_late
      if (event.event_type === 'AM_OUT') summary.am_time_out_early = event.is_early_out
      if (event.event_type === 'PM_IN') summary.pm_time_in_late = event.is_late
      if (event.event_type === 'PM_OUT') summary.pm_time_out_early = event.is_early_out
      continue
    }

    if (event.event_type === 'AM_IN') summary.extra_am_in_count += 1
    if (event.event_type === 'AM_OUT') summary.extra_am_out_count += 1
    if (event.event_type === 'PM_IN') summary.extra_pm_in_count += 1
    if (event.event_type === 'PM_OUT') summary.extra_pm_out_count += 1
  }

  return summary
}
