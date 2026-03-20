import { Card } from '../components/ui/Card'
import { MANILA_TZ } from '../lib/constants/attendance'

export const SettingsPage = () => {
  return (
    <Card title="Settings" className="space-y-2">
      <p className="text-sm">Timezone: {MANILA_TZ}</p>
      <p className="text-sm">Mode: Fully online, no offline queue enabled.</p>
      <p className="text-sm">Camera behavior: Manual only, scanner auto-start is disabled.</p>
    </Card>
  )
}
