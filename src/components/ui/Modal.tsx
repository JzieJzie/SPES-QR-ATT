import type { PropsWithChildren } from 'react'

import { Button } from './Button'

type ModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
}>

export const Modal = ({ open, title, onClose, children }: ModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3 md:p-4">
      <div className="w-full max-w-md border-2 border-black bg-white p-3 md:p-4 shadow-brutal animate-slideIn max-h-[90vh] overflow-y-auto">
        <div className="mb-3 md:mb-4 flex items-center justify-between gap-2">
          <h3 className="text-base md:text-lg font-heading uppercase flex-1 truncate">{title}</h3>
          <Button type="button" variant="outline" onClick={onClose} size="md">
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
  