import { format, formatInTimeZone, toZonedTime } from 'date-fns-tz'

import { MANILA_TZ } from '../constants/attendance'

export const getManilaNow = (): Date => toZonedTime(new Date(), MANILA_TZ)

export const toManilaDate = (date: Date | string): string =>
  formatInTimeZone(date, MANILA_TZ, 'yyyy-MM-dd')

export const toManilaTime = (date: Date | string): string =>
  formatInTimeZone(date, MANILA_TZ, 'HH:mm:ss')

export const formatTimestampWithSeconds = (date: Date | string): string =>
  formatInTimeZone(date, MANILA_TZ, 'yyyy-MM-dd HH:mm:ss')

export const formatReadableTimestamp = (date: Date | string): string =>
  formatInTimeZone(date, MANILA_TZ, 'MMM dd, yyyy hh:mm:ss a')

export const formatReadableTime = (date: Date | string): string =>
  formatInTimeZone(date, MANILA_TZ, 'hh:mm:ss a')

export const parseTimeToSeconds = (time: string): number => {
  const [hour, minute, second] = time.split(':').map(Number)
  return hour * 3600 + minute * 60 + second
}

export const fromIsoToReadable = (iso: string): string => {
  return format(toZonedTime(iso, MANILA_TZ), 'yyyy-MM-dd HH:mm:ss')
}
