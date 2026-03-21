import { useQuery } from '@tanstack/react-query'

import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase/client'

const fetchCounts = async () => {
  const [beneficiaryCount, archivedCount, todayCount] = await Promise.all([
    supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('is_archived', false),
    supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('is_archived', true),
    supabase.rpc('today_attendance_count'),
  ])

  return {
    activeBeneficiaries: beneficiaryCount.count ?? 0,
    archivedBeneficiaries: archivedCount.count ?? 0,
    todayAcceptedScans: todayCount.data ?? 0,
  }
}

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-counts'],
    queryFn: fetchCounts,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card title="Active Beneficiaries">
        <p className="text-3xl font-heading">{isLoading ? '...' : data?.activeBeneficiaries}</p>
      </Card>
      <Card title="Archived Beneficiaries">
        <p className="text-3xl font-heading">{isLoading ? '...' : data?.archivedBeneficiaries}</p>
      </Card>
      <Card title="Today Accepted Scans">
        <p className="text-3xl font-heading">{isLoading ? '...' : data?.todayAcceptedScans}</p>
      </Card>
    </div>
  )
}
