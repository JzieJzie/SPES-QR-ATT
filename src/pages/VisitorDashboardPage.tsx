import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase/client'

const fetchVisitorCounts = async (batch?: 'batch1' | 'batch2' | 'batch3' | 'batch4' | 'all') => {
  const { data, error } = await supabase.rpc('public_dashboard_counts')
  if (error) throw error

  const first = Array.isArray(data) ? data[0] : null
  let activeBeneficiaries = Number(first?.active_beneficiaries ?? 0)
  let todayAcceptedScans = Number(first?.today_accepted_scans ?? 0)

  if (batch && batch !== 'all') {
    const { count, error: benefError } = await supabase
      .from('beneficiaries')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false)
      .eq('program_batch', batch)

    if (!benefError) {
      activeBeneficiaries = count ?? 0
    }
  }

  return {
    activeBeneficiaries,
    todayAcceptedScans,
  }
}

export const VisitorDashboardPage = () => {
  const [selectedBatch, setSelectedBatch] = useState<'all' | 'batch1' | 'batch2' | 'batch3' | 'batch4'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['visitor-dashboard-counts', selectedBatch],
    queryFn: () => fetchVisitorCounts(selectedBatch === 'all' ? undefined : selectedBatch),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value as 'all' | 'batch1' | 'batch2' | 'batch3' | 'batch4')}
          className="px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded text-sm font-body"
        >
          <option value="all">All Batches</option>
          <option value="batch1">Batch 1</option>
          <option value="batch2">Batch 2</option>
          <option value="batch3">Batch 3</option>
          <option value="batch4">Batch 4</option>
        </select>
      </div>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:gap-3">
      <Card title="Active Beneficiaries">
          <p className="font-heading text-2xl md:text-3xl text-black dark:text-white">{isLoading ? '...' : data?.activeBeneficiaries}</p>
      </Card>
      <Card title="Today Accepted Scans">
          <p className="font-heading text-2xl md:text-3xl text-black dark:text-white">{isLoading ? '...' : data?.todayAcceptedScans}</p>
      </Card>
      </div>
    </div>
  )
}
