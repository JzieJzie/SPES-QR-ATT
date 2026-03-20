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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md border-2 border-black bg-white p-4 shadow-brutal animate-slideIn">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-heading uppercase">{title}</h3>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
