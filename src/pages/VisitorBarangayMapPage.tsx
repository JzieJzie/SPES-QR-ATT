import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase/client'
import { SANTA_ROSA_BARANGAYS } from '../lib/constants/barangays'

type LeaderDirectoryRecord = {
  id: string
  full_name: string | null
  role: 'leader' | 'co-leader'
  barangay_name: string | null
  avatar_url: string | null
}

const fetchPublicLeaderDirectory = async (): Promise<LeaderDirectoryRecord[]> => {
  const { data, error } = await supabase.rpc('list_leader_directory_public')
  if (error) throw error
  return (data ?? []) as LeaderDirectoryRecord[]
}

export const VisitorBarangayMapPage = () => {
  const [selectedBarangay, setSelectedBarangay] = useState<string>(SANTA_ROSA_BARANGAYS[0])

  const { data: directory = [], isLoading: isDirectoryLoading } = useQuery({
    queryKey: ['visitor-leaders-directory'],
    queryFn: fetchPublicLeaderDirectory,
  })

  const selectedBarangayUsers = useMemo(
    () => directory.filter((record) => record.barangay_name === selectedBarangay),
    [directory, selectedBarangay],
  )

  const selectedBarangayLeader = useMemo(
    () => selectedBarangayUsers.find((record) => record.role === 'leader') ?? null,
    [selectedBarangayUsers],
  )

  const selectedBarangayCoLeaders = useMemo(
    () => selectedBarangayUsers.filter((record) => record.role === 'co-leader'),
    [selectedBarangayUsers],
  )

  const mapEmbedUrl = useMemo(() => {
    const query = encodeURIComponent(`${selectedBarangay}, Santa Rosa, Laguna`)
    return `https://www.google.com/maps?q=${query}&output=embed`
  }, [selectedBarangay])

  const externalMapUrl = useMemo(() => {
    const query = encodeURIComponent(`${selectedBarangay}, Santa Rosa, Laguna`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }, [selectedBarangay])

  return (
    <Card title="Santa Rosa City Barangay Map" className="space-y-4">
      <p className="text-sm">
        Visitor view: dashboard and map only. Select a barangay to view map and assigned SPES leaders.
      </p>

      <div className="grid gap-3 md:grid-cols-[1fr,320px]">
        <div className="overflow-hidden border-2 border-black bg-zinc-100">
          <iframe
            title={`Google Map - ${selectedBarangay}`}
            src={mapEmbedUrl}
            className="h-[520px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="space-y-3 border-2 border-black bg-white p-3">
          <p className="text-sm font-semibold">Selected: {selectedBarangay}</p>

          <div className="space-y-1 border-2 border-black bg-zinc-50 p-2">
            <p className="text-xs font-semibold uppercase tracking-wide">SPES Leader</p>
            {isDirectoryLoading ? (
              <p className="text-sm">Loading leader info...</p>
            ) : selectedBarangayLeader ? (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 overflow-hidden rounded border-2 border-black bg-zinc-200">
                  {selectedBarangayLeader.avatar_url ? (
                    <img
                      src={selectedBarangayLeader.avatar_url}
                      alt={selectedBarangayLeader.full_name ?? 'Leader profile'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[10px] font-semibold">N/A</div>
                  )}
                </div>
                <p className="text-sm font-semibold">{selectedBarangayLeader.full_name ?? 'N/A'}</p>
              </div>
            ) : (
              <p className="text-sm">No leader assigned yet.</p>
            )}

            {selectedBarangayCoLeaders.length > 0 ? (
              <div className="space-y-1 pt-1">
                <p className="text-xs">Co-Leader{selectedBarangayCoLeaders.length > 1 ? 's' : ''}</p>
                <div className="space-y-1">
                  {selectedBarangayCoLeaders.map((record) => (
                    <div key={record.id} className="flex items-center gap-2">
                      <div className="h-8 w-8 overflow-hidden rounded border-2 border-black bg-zinc-200">
                        {record.avatar_url ? (
                          <img
                            src={record.avatar_url}
                            alt={record.full_name ?? 'Co-Leader profile'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-[10px] font-semibold">N/A</div>
                        )}
                      </div>
                      <p className="text-xs font-medium">{record.full_name ?? 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <a
            href={externalMapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm underline underline-offset-4"
          >
            Open in Google Maps
          </a>

          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {SANTA_ROSA_BARANGAYS.map((barangay) => (
              <Button
                key={barangay}
                type="button"
                className="w-full justify-start"
                variant={selectedBarangay === barangay ? 'danger' : 'outline'}
                onClick={() => setSelectedBarangay(barangay)}
              >
                {barangay}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
