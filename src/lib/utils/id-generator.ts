export const formatBeneficiaryId = (sequence: number): string => {
  const clamped = Math.max(1, Math.trunc(sequence))
  return `SPES-${clamped.toString().padStart(4, '0')}`
}

export const parseBeneficiaryId = (beneficiaryId: string): number => {
  const match = beneficiaryId.match(/^SPES-(\d{4,})$/)
  return match ? Number(match[1]) : 0
}
