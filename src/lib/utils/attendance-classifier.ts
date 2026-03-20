import { OFFICIAL_WINDOWS } from '../constants/attendance'
import { parseTimeToSeconds } from './time'

export type ClassificationResult = {
  eventType: 'AM_IN' | 'AM_OUT' | 'PM_IN' | 'PM_OUT' | null
  session: 'MORNING' | 'AFTERNOON' | null
  isLate: boolean
  isEarlyOut: boolean
  status: 'accepted' | 'invalid_window'
  reason: string
}

const seconds = {
  amInStart: parseTimeToSeconds(OFFICIAL_WINDOWS.amInStart),
  amInOnTimeEnd: parseTimeToSeconds(OFFICIAL_WINDOWS.amInOnTimeEnd),
  amInLateEnd: parseTimeToSeconds(OFFICIAL_WINDOWS.amInLateEnd),
  amOutEarlyEnd: parseTimeToSeconds(OFFICIAL_WINDOWS.amOutEarlyEnd),
  amOutCutoff: parseTimeToSeconds(OFFICIAL_WINDOWS.amOutCutoff),
  pmInStart: parseTimeToSeconds(OFFICIAL_WINDOWS.pmInStart),
  pmInOnTimeEnd: parseTimeToSeconds(OFFICIAL_WINDOWS.pmInOnTimeEnd),
  pmInLateEnd: parseTimeToSeconds(OFFICIAL_WINDOWS.pmInLateEnd),
  pmOutEarlyEnd: parseTimeToSeconds(OFFICIAL_WINDOWS.pmOutEarlyEnd),
  pmOutCutoff: parseTimeToSeconds(OFFICIAL_WINDOWS.pmOutCutoff),
}

type ExistingSlots = {
  amTimeOut: string | null
}

export const classifyAttendanceTime = (
  hhmmss: string,
  existingSlots: ExistingSlots,
): ClassificationResult => {
  const now = parseTimeToSeconds(hhmmss)

  if (now >= seconds.amInStart && now <= seconds.amInLateEnd) {
    return {
      eventType: 'AM_IN',
      session: 'MORNING',
      isLate: now > seconds.amInOnTimeEnd,
      isEarlyOut: false,
      status: 'accepted',
      reason: now > seconds.amInOnTimeEnd ? 'Late' : 'On time',
    }
  }

  if (now > seconds.amInLateEnd && now < seconds.pmInStart) {
    return {
      eventType: 'AM_OUT',
      session: 'MORNING',
      isLate: false,
      isEarlyOut: now <= seconds.amOutEarlyEnd,
      status: 'accepted',
      reason: now <= seconds.amOutEarlyEnd ? 'Early out' : 'Regular AM time-out',
    }
  }

  if (now >= seconds.pmInStart && now <= seconds.amOutCutoff) {
    if (!existingSlots.amTimeOut) {
      return {
        eventType: 'AM_OUT',
        session: 'MORNING',
        isLate: false,
        isEarlyOut: false,
        status: 'accepted',
        reason: 'Regular AM time-out',
      }
    }

    return {
      eventType: 'PM_IN',
      session: 'AFTERNOON',
      isLate: now > seconds.pmInOnTimeEnd,
      isEarlyOut: false,
      status: 'accepted',
      reason: now > seconds.pmInOnTimeEnd ? 'Late' : 'On time',
    }
  }

  if (now > seconds.amOutCutoff && now <= seconds.pmInLateEnd) {
    return {
      eventType: 'PM_IN',
      session: 'AFTERNOON',
      isLate: now > seconds.pmInOnTimeEnd,
      isEarlyOut: false,
      status: 'accepted',
      reason: now > seconds.pmInOnTimeEnd ? 'Late' : 'On time',
    }
  }

  if (now > seconds.pmInLateEnd && now <= seconds.pmOutCutoff) {
    return {
      eventType: 'PM_OUT',
      session: 'AFTERNOON',
      isLate: false,
      isEarlyOut: now <= seconds.pmOutEarlyEnd,
      status: 'accepted',
      reason: now <= seconds.pmOutEarlyEnd ? 'Early out' : 'Regular PM time-out',
    }
  }

  return {
    eventType: null,
    session: null,
    isLate: false,
    isEarlyOut: false,
    status: 'invalid_window',
    reason: 'Invalid scan window',
  }
}
