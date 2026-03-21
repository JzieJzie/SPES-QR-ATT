import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { ArchiveConfirmDialog } from '../features/beneficiaries/ArchiveConfirmDialog'
import { archiveBeneficiary, fetchBeneficiaries } from '../features/beneficiaries/api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Table, Td, Th } from '../components/ui/Table'

export const BeneficiariesPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState<{ id: string; beneficiaryId: string } | null>(null)

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

  const filtered = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) return data

    return data.filter((row) => {
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
  }, [data, keyword])

  return (
    <Card title="Beneficiaries" className="space-y-3 md:space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          placeholder="Search by name, ID, barangay"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="flex-1"
        />
        <Button variant="outline" onClick={() => navigate('/beneficiaries/archived')} size="md" className="sm:flex-shrink-0">
          View Archived
        </Button>
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
            ) : (
              filtered.map((beneficiary) => (
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
