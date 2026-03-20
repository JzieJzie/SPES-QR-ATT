import { supabase } from '../../lib/supabase/client'
import type { Beneficiary } from '../../types/domain'

export type BeneficiaryWithBarangay = Beneficiary & {
  barangays: {
    id: string
    name: string
  }
}

export const fetchBeneficiaries = async (
  includeArchived = false,
): Promise<BeneficiaryWithBarangay[]> => {
  const query = supabase
    .from('beneficiaries')
    .select('*, barangays:barangay_id (id, name)')
    .order('beneficiary_id')

  if (!includeArchived) {
    query.eq('is_archived', false)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as BeneficiaryWithBarangay[]
}

export const fetchBeneficiaryById = async (id: string): Promise<BeneficiaryWithBarangay | null> => {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*, barangays:barangay_id (id, name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as BeneficiaryWithBarangay
}

export const archiveBeneficiary = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('beneficiaries')
    .update({ is_archived: true })
    .eq('id', id)

  if (error) throw error
}

export const restoreBeneficiary = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('beneficiaries')
    .update({ is_archived: false })
    .eq('id', id)

  if (error) throw error
}

export const updateBeneficiary = async (
  id: string,
  payload: Pick<Beneficiary, 'first_name' | 'last_name' | 'middle_name' | 'barangay_id'>,
): Promise<void> => {
  const { error } = await supabase
    .from('beneficiaries')
    .update(payload)
    .eq('id', id)

  if (error) throw error
}
