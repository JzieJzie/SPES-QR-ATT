import { z } from 'zod'

export const importRowSchema = z.object({
  lastName: z.string().trim().min(1, 'lastName is required'),
  firstName: z.string().trim().min(1, 'firstName is required'),
  middleName: z.string().trim().optional().default(''),
  Barangay: z.string().trim().min(1, 'Barangay is required'),
})

export type ImportRow = z.infer<typeof importRowSchema>
