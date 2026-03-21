import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Table, Td, Th } from '../components/ui/Table'
import { fetchBeneficiaries, restoreBeneficiary } from '../features/beneficiaries/api'

export const ArchivedBeneficiariesPage = () => {
  const queryClient = useQueryClient()
  const { data = [], isLoading } = useQuery({
    queryKey: ['beneficiaries', 'archived'],
    queryFn: async () => (await fetchBeneficiaries(true)).filter((row) => row.is_archived),
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreBeneficiary(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
    },
  })

  return (
    <Card title="Archived Beneficiaries">
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
              data.map((row) => (
                <tr key={row.id}>
                  <Td>{row.beneficiary_id}</Td>
                  <Td>{`${row.last_name}, ${row.first_name}`}</Td>
                  <Td>{row.barangays.name}</Td>
                  <Td>
                    <Button variant="outline" onClick={() => void restoreMutation.mutateAsync(row.id)} size="md">
                      Restore
                    </Button>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      </div>
    </Card>
  )
}
