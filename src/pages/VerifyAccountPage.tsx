import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { verifyAccount } from '../features/auth/api'

export const VerifyAccountPage = () => {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])

  const mutation = useMutation({
    mutationFn: () => verifyAccount(token),
  })

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md space-y-4" title="Verify Account">
        <p className="text-sm">Confirm your email to activate your SPES QR Attendance account.</p>
        {!token ? <p className="text-sm font-semibold">Invalid verification link.</p> : null}

        {mutation.isSuccess ? (
          <p className="text-sm font-semibold">{mutation.data}</p>
        ) : null}

        {mutation.isError ? (
          <p className="text-sm font-semibold">
            {mutation.error instanceof Error ? mutation.error.message : 'Verification failed.'}
          </p>
        ) : null}

        {!mutation.isSuccess ? (
          <Button
            size="lg"
            className="w-full"
            disabled={!token || mutation.isPending}
            onClick={() => void mutation.mutate()}
          >
            {mutation.isPending ? 'Verifying...' : 'Verify email'}
          </Button>
        ) : null}

        <p className="text-sm">
          Continue to{' '}
          <Link to="/login" className="underline underline-offset-4">
            Login
          </Link>
        </p>
      </Card>
    </main>
  )
}
