import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Card } from '../components/ui/Card'
import { Table, Td, Th } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { fetchUsers, setUserRole } from '../features/users/api'

type ManageableRole = 'leader' | 'co-leader' | 'developer'

export const UserManagementPage = () => {
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const mutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: ManageableRole }) =>
      setUserRole(userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return (
    <Card title="User Management">
      <Table>
        <thead>
          <tr>
            <Th>User ID</Th>
            <Th>Full Name</Th>
            <Th>Role</Th>
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
              <Td />
            </tr>
          ) : (
            data.map((user) => (
              <tr key={user.id}>
                <Td>
                  <span className="break-all font-mono text-[10px] md:text-xs">{user.id}</span>
                </Td>
                <Td>{user.full_name ?? 'N/A'}</Td>
                <Td>{user.role}</Td>
                <Td>{user.barangay_name ?? 'N/A'}</Td>
                <Td>
                  <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => void mutation.mutateAsync({ userId: user.id, role: 'leader' })}
                      size="md"
                    >
                      Leader
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void mutation.mutateAsync({ userId: user.id, role: 'co-leader' })}
                      size="md"
                    >
                      Co-Leader
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void mutation.mutateAsync({ userId: user.id, role: 'developer' })}
                      size="md"
                    >
                      Developer
                    </Button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Card>
  )
}
