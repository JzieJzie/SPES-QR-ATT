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
            data.map((user) => (
              <tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.full_name ?? 'N/A'}</Td>
                <Td>{user.role}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void mutation.mutateAsync({ userId: user.id, role: 'leader' })}
                    >
                      Make Leader
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void mutation.mutateAsync({ userId: user.id, role: 'co-leader' })}
                    >
                      Make Co-Leader
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void mutation.mutateAsync({ userId: user.id, role: 'developer' })}
                    >
                      Make Developer
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
