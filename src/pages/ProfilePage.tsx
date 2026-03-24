import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import {
  fetchBarangays,
  fetchCurrentProfile,
  updateMyProfile,
  uploadProfilePicture,
} from '../features/profile/api'

export const ProfilePage = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [barangayId, setBarangayId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const profileQuery = useQuery({
    queryKey: ['my-profile'],
    queryFn: fetchCurrentProfile,
  })

  const barangaysQuery = useQuery({
    queryKey: ['profile-barangays'],
    queryFn: fetchBarangays,
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !profileQuery.data) {
        throw new Error('Profile is unavailable.')
      }

      let avatarUrl = profileQuery.data.avatar_url
      if (selectedFile) {
        avatarUrl = await uploadProfilePicture(userId, selectedFile)
      }

      await updateMyProfile({
        fullName,
        barangayId,
        avatarUrl,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsEditing(false)
      setSelectedFile(null)
    },
  })

  const startEdit = () => {
    const profile = profileQuery.data
    if (!profile) return

    setFullName(profile.full_name ?? '')
    setBarangayId(profile.barangay_id ?? '')
    setIsEditing(true)
  }

  if (profileQuery.isLoading) {
    return <Card title="My Profile">Loading profile...</Card>
  }

  if (profileQuery.isError || !profileQuery.data) {
    return <Card title="My Profile">Unable to load profile right now.</Card>
  }

  const profile = profileQuery.data

  return (
    <Card title="My Profile" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[160px,1fr]">
        <div className="h-40 w-40 overflow-hidden border-2 border-black dark:border-white bg-white dark:bg-black">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-xs font-semibold">No Photo</div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Name:</span> {profile.full_name ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {profile.role}
          </p>
          <p>
            <span className="font-semibold">Barangay:</span> {profile.barangays?.name ?? 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Email Verified:</span> {profile.email_verified ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {!isEditing ? (
        <Button onClick={startEdit}>Edit Profile</Button>
      ) : (
        <div className="space-y-3 border-2 border-black dark:border-white p-3">
          <label className="grid gap-1 text-sm">
            Full Name
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>

          <label className="grid gap-1 text-sm">
            Barangay
            <select
              value={barangayId}
              onChange={(event) => setBarangayId(event.target.value)}
              className="w-full border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white px-2 py-2 text-sm"
            >
              <option value="">Select barangay</option>
              {(barangaysQuery.data ?? []).map((barangay) => (
                <option key={barangay.id} value={barangay.id}>
                  {barangay.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Profile Picture (Optional)
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {updateMutation.isError ? (
            <p className="text-sm font-semibold">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : 'Unable to update profile.'}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setSelectedFile(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
