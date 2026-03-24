import { Card } from '../../components/ui/Card'

type BeneficiaryQrPreviewProps = {
  beneficiaryId: string
  imageUrl: string | null
}

export const BeneficiaryQrPreview = ({ beneficiaryId, imageUrl }: BeneficiaryQrPreviewProps) => (
  <Card title="QR Preview" className="space-y-3">
    <p className="font-mono text-sm">{beneficiaryId}</p>
    {imageUrl ? (
      <img src={imageUrl} alt={`QR for ${beneficiaryId}`} className="w-full border-2 border-black dark:border-white" />
    ) : (
      <p className="text-sm">No QR image found.</p>
    )}
  </Card>
)
