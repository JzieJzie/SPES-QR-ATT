import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Table, Td, Th } from '../components/ui/Table'
import { fetchDailyAttendance } from '../features/attendance/api'
import { formatReadableTime, toManilaDate } from '../lib/utils/time'

export const DailyAttendancePage = () => {
  const [date, setDate] = useState(toManilaDate(new Date()))

  const { data = [], isLoading } = useQuery({
    queryKey: ['daily-attendance', date],
    queryFn: () => fetchDailyAttendance(date),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  const rows = useMemo(() => data, [data])

  return (
    <Card title="Daily Attendance" className="space-y-3 md:space-y-4">
      <label className="grid gap-1 text-xs md:text-sm max-w-xs">
        Date
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      <div className="overflow-x-auto -mx-2 md:mx-0">
        <Table>
          <thead>
            <tr>
              <Th>Beneficiary</Th>
              <Th>Barangay</Th>
              <Th>AM In</Th>
              <Th>AM Out</Th>
              <Th>PM In</Th>
              <Th>PM Out</Th>
              <Th>Flags</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <Td>Loading...</Td>
                <Td />
                <Td />
                <Td />
                <Td />
                <Td />
                <Td />
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <Td>{`${row.beneficiaries.beneficiary_id} - ${row.beneficiaries.last_name}, ${row.beneficiaries.first_name}`}</Td>
                  <Td>{row.beneficiaries.barangays.name}</Td>
                  <Td>{row.am_time_in ? formatReadableTime(row.am_time_in) : '-'}</Td>
                  <Td>{row.am_time_out ? formatReadableTime(row.am_time_out) : '-'}</Td>
                <Td>{row.pm_time_in ? formatReadableTime(row.pm_time_in) : '-'}</Td>
                <Td>{row.pm_time_out ? formatReadableTime(row.pm_time_out) : '-'}</Td>
                <Td>
                  {[
                    row.am_time_in_late ? 'AM Late' : null,
                    row.am_time_out_early ? 'AM Early Out' : null,
                    row.pm_time_in_late ? 'PM Late' : null,
                    row.pm_time_out_early ? 'PM Early Out' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'None'}
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      </div>
    </Card>
  )
}
