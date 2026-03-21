import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { supabase } from '../lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>

const toFriendlyLoginError = (message: string): string => {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'User does not exist, or the email/password is incorrect.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Email is not confirmed yet. Please verify your email first.'
  }

  return 'Unable to log in right now. Please try again.'
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (payload: LoginForm) => {
    setErrorMessage('')
    const { error } = await supabase.auth.signInWithPassword(payload)
    if (error) {
      setErrorMessage(toFriendlyLoginError(error.message))
      return
    }

    navigate('/')
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md space-y-4" title="SPES QR Attendance">
        <p className="text-sm">Sign in to scan, manage beneficiaries, and generate reports.</p>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-1 text-sm">
            Email
            <Input type="email" autoComplete="email" {...register('email')} />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <Input type="password" autoComplete="current-password" {...register('password')} />
          </label>
          {errorMessage ? <p className="text-sm font-semibold">{errorMessage}</p> : null}
          <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <p className="text-sm">
          <Link to="/register" className="underline underline-offset-4">
            Create account
          </Link>
        </p>
      </Card>
    </main>
  )
}
