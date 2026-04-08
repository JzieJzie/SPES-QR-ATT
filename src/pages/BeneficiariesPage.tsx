import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { ArchiveConfirmDialog } from '../features/beneficiaries/ArchiveConfirmDialog'
import { archiveBeneficiary, fetchBeneficiaries } from '../features/beneficiaries/api'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Table, Td, Th } from '../components/ui/Table'

export const BeneficiariesPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [selectedBarangayId, setSelectedBarangayId] = useState<'all' | string>('all')
  const [selectedBatch, setSelectedBatch] = useState<'all' | 'batch1' | 'batch2' | 'batch3' | 'batch4'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState<{ id: string; beneficiaryId: string } | null>(null)
  const pageSize = 50
  const isDeveloper = profile?.role === 'developer'

  const { data = [], isLoading } = useQuery({
    queryKey: ['beneficiaries', 'active'],
    queryFn: () => fetchBeneficiaries(false),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveBeneficiary(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
      setSelected(null)
    },
  })

  const barangays = useMemo(() => {
    const unique = new Map<string, string>()

    data.forEach((row) => {
      unique.set(row.barangays.id, row.barangays.name)
    })

    return Array.from(unique, ([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const filtered = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    return data.filter((row) => {
      if (selectedBarangayId !== 'all' && row.barangays.id !== selectedBarangayId) {
        return false
      }

      if (isDeveloper && selectedBatch !== 'all' && row.program_batch !== selectedBatch) {
        return false
      }

      if (!normalized) return true

      const haystack = [
        row.beneficiary_id,
        row.first_name,
        row.last_name,
        row.middle_name ?? '',
        row.barangays.name,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalized)
    })
  }, [data, keyword, selectedBarangayId, selectedBatch, isDeveloper])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginated = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safeCurrentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [keyword, selectedBarangayId, selectedBatch])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <Card title="Beneficiaries" className="space-y-3 md:space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          placeholder="Search by name, ID, barangay"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="flex-1"
        />
        {isDeveloper ? (
          <select
            value={selectedBatch}
            onChange={(event) => setSelectedBatch(event.target.value as 'all' | 'batch1' | 'batch2' | 'batch3' | 'batch4')}
            className="w-full border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white px-2 py-2 text-sm sm:w-44"
          >
            <option value="all">All Batches</option>
            <option value="batch1">Batch 1</option>
            <option value="batch2">Batch 2</option>
            <option value="batch3">Batch 3</option>
            <option value="batch4">Batch 4</option>
          </select>
        ) : null}
        <Button variant="outline" onClick={() => navigate('/beneficiaries/archived')} size="md" className="sm:flex-shrink-0">
          View Archived
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[220px_1fr] md:gap-4">
        <aside className="border-2 border-black dark:border-white bg-white dark:bg-black p-2">
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide">Barangays</p>
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
            <Button
              type="button"
              variant={selectedBarangayId === 'all' ? 'primary' : 'outline'}
              size="md"
              className="whitespace-nowrap md:w-full md:justify-start"
              onClick={() => setSelectedBarangayId('all')}
            >
              All Barangays
            </Button>
            {barangays.map((barangay) => (
              <Button
                key={barangay.id}
                type="button"
                variant={selectedBarangayId === barangay.id ? 'primary' : 'outline'}
                size="md"
                className="whitespace-nowrap md:w-full md:justify-start"
                onClick={() => setSelectedBarangayId(barangay.id)}
              >
                {barangay.name}
              </Button>
            ))}
          </div>
        </aside>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs md:text-sm">
              Showing{' '}
              {filtered.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
              -
              {Math.min(safeCurrentPage * pageSize, filtered.length)} of {filtered.length} beneficiaries
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                disabled={safeCurrentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold md:text-sm">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                disabled={safeCurrentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 md:mx-0">
          <Table>
            <thead>
              <tr>
                <Th>Beneficiary ID</Th>
                <Th>Name</Th>
                <Th>Barangay</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <Td>Loading...</Td>
                  <Td />
                  <Td />
                  <Td />
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <Td>
                    {selectedBarangayId === 'all'
                      ? isDeveloper && selectedBatch !== 'all'
                          ? `No beneficiaries found for Batch ${selectedBatch.replace('batch', '')}.`
                        : 'No beneficiaries found.'
                      : 'No beneficiaries found in this barangay.'}
                  </Td>
                  <Td />
                  <Td />
                  <Td />
                </tr>
              ) : (
                paginated.map((beneficiary) => (
                  <tr key={beneficiary.id}>
                    <Td>{beneficiary.beneficiary_id}</Td>
                    <Td>{`${beneficiary.last_name}, ${beneficiary.first_name} ${beneficiary.middle_name ?? ''}`}</Td>
                    <Td>{beneficiary.barangays.name}</Td>
                    <Td>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setSelected({
                            id: beneficiary.id,
                            beneficiaryId: beneficiary.beneficiary_id,
                          })
                        }
                        size="md"
                      >
                        Archive
                      </Button>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          </div>
        </div>
      </div>

      <ArchiveConfirmDialog
        open={Boolean(selected)}
        beneficiaryId={selected?.beneficiaryId ?? ''}
        onClose={() => setSelected(null)}
        onConfirm={async () => {
          if (!selected) return
          await archiveMutation.mutateAsync(selected.id)
        }}
      />
    </Card>
  )
}
