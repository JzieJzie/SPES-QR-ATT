import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { fetchBeneficiaryById, updateBeneficiary } from '../features/beneficiaries/api'
import { BeneficiaryQrPreview } from '../features/beneficiaries/BeneficiaryQrPreview'
import { supabase } from '../lib/supabase/client'

type BeneficiaryForm = {
  first_name: string
  last_name: string
  middle_name: string
}

export const BeneficiaryDetailsPage = () => {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['beneficiary', id],
    queryFn: () => fetchBeneficiaryById(id),
    enabled: Boolean(id),
  })

  const { data: qrData } = useQuery({
    queryKey: ['beneficiary-qr', id],
    queryFn: async () => {
      const { data: qrCode } = await supabase
        .from('beneficiary_qr_codes')
        .select('qr_image_path')
        .eq('beneficiary_ref', id)
        .maybeSingle()

      if (!qrCode?.qr_image_path) return null
      const { data: signed } = await supabase.storage
        .from('qr-codes')
        .createSignedUrl(qrCode.qr_image_path, 120)

      return signed?.signedUrl ?? null
    },
    enabled: Boolean(id),
  })

  const { register, handleSubmit, reset } = useForm<BeneficiaryForm>({
    values: {
      first_name: data?.first_name ?? '',
      last_name: data?.last_name ?? '',
      middle_name: data?.middle_name ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: BeneficiaryForm) =>
      updateBeneficiary(id, {
        first_name: payload.first_name.toUpperCase(),
        last_name: payload.last_name.toUpperCase(),
        middle_name: payload.middle_name.toUpperCase() || null,
        barangay_id: data?.barangay_id ?? '',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['beneficiary', id] })
    },
  })

  const title = useMemo(
    () => (data ? `${data.beneficiary_id} - ${data.last_name}, ${data.first_name}` : 'Beneficiary'),
    [data],
  )

  if (!data) {
    return <Card title="Beneficiary">No record selected.</Card>
  }

  return (
    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
      <Card title={title}>
        <form
          className="grid gap-3"
          onSubmit={handleSubmit(async (payload) => {
            await updateMutation.mutateAsync(payload)
            reset(payload)
          })}
        >
          <label className="grid gap-1 text-sm">
            Last Name
            <Input {...register('last_name')} />
          </label>
          <label className="grid gap-1 text-sm">
            First Name
            <Input {...register('first_name')} />
          </label>
          <label className="grid gap-1 text-sm">
            Middle Name
            <Input {...register('middle_name')} />
          </label>
          <Button type="submit" disabled={updateMutation.isPending}>
            Save Changes
          </Button>
        </form>
      </Card>
      <BeneficiaryQrPreview beneficiaryId={data.beneficiary_id} imageUrl={qrData ?? null} />
    </div>
  )
}
