import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../hooks/useAuth'

const fetchCounts = async (batch?: 'batch1' | 'batch2' | 'all') => {
  let beneficiaryQuery = supabase
    .from('beneficiaries')
    .select('*', { count: 'exact', head: true })
    .eq('is_archived', false)
  let archivedQuery = supabase
    .from('beneficiaries')
    .select('*', { count: 'exact', head: true })
    .eq('is_archived', true)
  
  if (batch && batch !== 'all') {
    beneficiaryQuery = beneficiaryQuery.eq('program_batch', batch)
    archivedQuery = archivedQuery.eq('program_batch', batch)
  }

  const [beneficiaryCount, archivedCount, todayCount] = await Promise.all([
    beneficiaryQuery,
    archivedQuery,
    supabase.rpc('today_attendance_count'),
  ])

  return {
    activeBeneficiaries: beneficiaryCount.count ?? 0,
    archivedBeneficiaries: archivedCount.count ?? 0,
    todayAcceptedScans: todayCount.data ?? 0,
  }
}

export const DashboardPage = () => {
  const { profile } = useAuth()
  const [selectedBatch, setSelectedBatch] = useState<'all' | 'batch1' | 'batch2'>('all')
  const isDeveloper = profile?.role === 'developer'

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-counts', selectedBatch],
    queryFn: () => fetchCounts(selectedBatch === 'all' ? undefined : selectedBatch),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  return (
    <div className="space-y-4">
      {isDeveloper && (
        <div className="flex gap-2">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value as 'all' | 'batch1' | 'batch2')}
            className="px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded text-sm font-body"
          >
            <option value="all">All Batches</option>
            <option value="batch1">Batch 1</option>
            <option value="batch2">Batch 2</option>
          </select>
        </div>
      )}
      <div className="grid gap-2 md:gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card title="Active Beneficiaries">
          <p className="text-2xl md:text-3xl font-heading text-black dark:text-white">{isLoading ? '...' : data?.activeBeneficiaries}</p>
        </Card>
        <Card title="Archived Beneficiaries">
          <p className="text-2xl md:text-3xl font-heading text-black dark:text-white">{isLoading ? '...' : data?.archivedBeneficiaries}</p>
        </Card>
        <Card title="Today Accepted Scans">
          <p className="text-2xl md:text-3xl font-heading text-black dark:text-white">{isLoading ? '...' : data?.todayAcceptedScans}</p>
        </Card>
      </div>
    </div>
  )
}
