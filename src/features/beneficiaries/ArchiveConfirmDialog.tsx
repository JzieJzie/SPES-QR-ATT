import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'

type ArchiveConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  beneficiaryId: string
}

export const ArchiveConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  beneficiaryId,
}: ArchiveConfirmDialogProps) => {
  return (
    <Modal open={open} title="Archive Beneficiary" onClose={onClose}>
      <p className="mb-4 text-sm">
        Archive {beneficiaryId}? Historical attendance remains in reports but new scans are blocked.
      </p>
      <div className="flex gap-2">
        <Button variant="danger" onClick={() => void onConfirm()}>
          Archive
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  )
}
