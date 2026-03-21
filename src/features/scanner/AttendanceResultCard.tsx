import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'

import { formatReadableTimestamp } from '../../lib/utils/time'

type AttendanceResultCardProps = {
  result: {
    status: 'accepted' | 'duplicate' | 'invalid_window' | 'manual' | 'rejected'
    message: string
    event_type: 'AM_IN' | 'AM_OUT' | 'PM_IN' | 'PM_OUT' | null
    scanned_at: string
  } | null
}

export const AttendanceResultCard = ({ result }: AttendanceResultCardProps) => {
  if (!result) {
    return (
      <Card title="Scan Result">
        <p className="text-xs md:text-sm">No scan yet.</p>
      </Card>
    )
  }

  const tone = result.status === 'accepted' ? 'good' : result.status === 'duplicate' ? 'default' : 'danger'

  return (
    <Card title="Scan Result" className="space-y-2 md:space-y-3">
      <Badge tone={tone}>{result.status}</Badge>
      <p className="text-xs md:text-sm break-words">{result.message}</p>
      <dl className="grid grid-cols-[100px,1fr] md:grid-cols-[120px,1fr] gap-2 text-xs md:text-sm">
        <dt className="font-mono truncate">Event Type</dt>
        <dd>{result.event_type ?? 'N/A'}</dd>
        <dt className="font-mono truncate">Timestamp</dt>
        <dd className="break-words">{formatReadableTimestamp(result.scanned_at)} (PHT)</dd>
      </dl>
    </Card>
  )
}
