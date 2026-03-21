import { useQuery } from '@tanstack/react-query'

import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase/client'

const fetchVisitorCounts = async () => {
  const { data, error } = await supabase.rpc('public_dashboard_counts')
  if (error) throw error

  const first = Array.isArray(data) ? data[0] : null
  return {
    activeBeneficiaries: Number(first?.active_beneficiaries ?? 0),
    archivedBeneficiaries: Number(first?.archived_beneficiaries ?? 0),
    todayAcceptedScans: Number(first?.today_accepted_scans ?? 0),
  }
}

export const VisitorDashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['visitor-dashboard-counts'],
    queryFn: fetchVisitorCounts,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  return (
    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-3">
      <Card title="Active Beneficiaries">
        <p className="font-heading text-2xl md:text-3xl">{isLoading ? '...' : data?.activeBeneficiaries}</p>
      </Card>
      <Card title="Archived Beneficiaries">
        <p className="font-heading text-2xl md:text-3xl">{isLoading ? '...' : data?.archivedBeneficiaries}</p>
      </Card>
      <Card title="Today Accepted Scans">
        <p className="font-heading text-2xl md:text-3xl">{isLoading ? '...' : data?.todayAcceptedScans}</p>
      </Card>
    </div>
  )
}
