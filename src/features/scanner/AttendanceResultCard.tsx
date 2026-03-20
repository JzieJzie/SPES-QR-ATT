import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'

import { formatTimestampWithSeconds } from '../../lib/utils/time'

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
        <p className="text-sm">No scan yet.</p>
      </Card>
    )
  }

  const tone = result.status === 'accepted' ? 'good' : result.status === 'duplicate' ? 'default' : 'danger'

  return (
    <Card title="Scan Result" className="space-y-3">
      <Badge tone={tone}>{result.status}</Badge>
      <p className="text-sm">{result.message}</p>
      <dl className="grid grid-cols-[120px,1fr] gap-2 text-sm">
        <dt className="font-mono">Event Type</dt>
        <dd>{result.event_type ?? 'N/A'}</dd>
        <dt className="font-mono">Timestamp</dt>
        <dd>{formatTimestampWithSeconds(result.scanned_at)}</dd>
      </dl>
    </Card>
  )
}
