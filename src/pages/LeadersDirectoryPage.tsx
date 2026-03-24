import { useQuery } from '@tanstack/react-query'

import { Card } from '../components/ui/Card'
import { Table, Td, Th } from '../components/ui/Table'
import { fetchLeaderDirectory } from '../features/users/api'

export const LeadersDirectoryPage = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['leaders-directory'],
    queryFn: fetchLeaderDirectory,
  })

  return (
    <Card title="Registered Leaders and Co-Leaders" className="space-y-3">
      <p className="text-sm">Directory of registered leaders and co-leaders with assigned barangays.</p>
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Role</Th>
            <Th>Batch</Th>
            <Th>Barangay</Th>
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
          ) : data.length === 0 ? (
            <tr>
              <Td>No registered leaders/co-leaders yet.</Td>
              <Td />
              <Td />
              <Td />
            </tr>
          ) : (
            data.map((leader) => (
              <tr key={leader.id}>
                <Td>
                  <span className="break-words">{leader.full_name ?? 'N/A'}</span>
                </Td>
                <Td>{leader.role}</Td>
                <Td>{leader.program_batch === 'batch2' ? 'Batch 2' : 'Batch 1'}</Td>
                <Td>
                  <span className="break-words">{leader.barangay_name ?? 'N/A'}</span>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Card>
  )
}
