import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { registerAccount } from '../features/auth/api'
import { SANTA_ROSA_BARANGAYS } from '../lib/constants/barangays'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Use a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['leader', 'co-leader']),
  barangayName: z.string().min(1, 'Barangay is required'),
  leaderAccessCode: z.string().optional(),
  avatarFile: z.any().optional(),
}).superRefine((values, context) => {
  if (values.role === 'leader' && !values.leaderAccessCode?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['leaderAccessCode'],
      message: 'Leader access code is required for Leader registration.',
    })
  }
})

type RegisterForm = z.infer<typeof registerSchema>

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Unable to read image file.'))
    reader.readAsDataURL(file)
  })

export const RegisterPage = () => {
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { register, handleSubmit, formState, control } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'co-leader',
      barangayName: '',
      leaderAccessCode: '',
    },
  })

  const selectedRole = useWatch({ control, name: 'role' })

  const mutation = useMutation({
    mutationFn: registerAccount,
    onSuccess: (successMessage) => {
      setErrorMessage('')
      setMessage(successMessage)
    },
    onError: (error) => {
      setMessage('')
      setErrorMessage(error instanceof Error ? error.message : 'Unable to register account.')
    },
  })

  const onSubmit = async (values: RegisterForm) => {
    setMessage('')
    setErrorMessage('')

    let avatarBase64: string | undefined
    let avatarMimeType: string | undefined

    const files = values.avatarFile as FileList | undefined
    const selectedFile = files?.[0]

    if (selectedFile) {
      avatarBase64 = await toBase64(selectedFile)
      avatarMimeType = selectedFile.type
    }

    await mutation.mutateAsync({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      role: values.role,
      barangayName: values.barangayName,
      leaderAccessCode: values.leaderAccessCode,
      avatarBase64,
      avatarMimeType,
    })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-100 p-4">
      <Card className="w-full max-w-lg space-y-4" title="Create Account">
        <p className="text-sm">Register as a Leader or Co-Leader. Profile picture is optional.</p>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-1 text-sm">
            Full Name
            <Input {...register('fullName')} />
          </label>
          <label className="grid gap-1 text-sm">
            Email
            <Input type="email" autoComplete="email" {...register('email')} />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <Input type="password" autoComplete="new-password" {...register('password')} />
          </label>
          <label className="grid gap-1 text-sm">
            Role
            <select
              {...register('role')}
              className="w-full border-2 border-black bg-white px-2 py-2 text-sm"
            >
              <option value="leader">Leader</option>
              <option value="co-leader">Co-Leader</option>
            </select>
          </label>
          {selectedRole === 'leader' ? (
            <label className="grid gap-1 text-sm">
              Leader Access Code
              <Input type="password" autoComplete="off" {...register('leaderAccessCode')} />
              {formState.errors.leaderAccessCode ? (
                <span className="text-xs font-semibold">{formState.errors.leaderAccessCode.message}</span>
              ) : null}
            </label>
          ) : null}
          <label className="grid gap-1 text-sm">
            Barangay
            <select {...register('barangayName')} className="w-full border-2 border-black bg-white px-2 py-2 text-sm">
              <option value="">Select barangay</option>
              {SANTA_ROSA_BARANGAYS.map((barangayName) => (
                <option key={barangayName} value={barangayName}>
                  {barangayName}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Profile Picture (Optional)
            <Input type="file" accept="image/*" {...register('avatarFile')} />
          </label>

          {message ? <p className="text-sm font-semibold">{message}</p> : null}
          {errorMessage ? <p className="text-sm font-semibold">{errorMessage}</p> : null}

          <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting || mutation.isPending}>
            {formState.isSubmitting || mutation.isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm">
          Already registered?{' '}
          <Link to="/login" className="underline underline-offset-4">
            Log in here
          </Link>
        </p>
      </Card>
    </main>
  )
}
