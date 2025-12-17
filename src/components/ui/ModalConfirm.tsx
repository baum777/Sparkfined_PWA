import React from 'react'
import { Modal } from './Modal'
import Button from './Button'

export type ModalConfirmProps = {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'destructive' | 'primary'
  isConfirmLoading?: boolean
  onConfirm: () => void | Promise<void>
  onClose: () => void
  'data-testid'?: string
}

export function ModalConfirm({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  isConfirmLoading = false,
  onConfirm,
  onClose,
  'data-testid': dataTestId,
}: ModalConfirmProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
      <div className="mt-6 flex items-center justify-end gap-3" data-testid={dataTestId ?? 'modal-confirm-actions'}>
        <Button variant="secondary" onClick={onClose} disabled={isConfirmLoading}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} isLoading={isConfirmLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ModalConfirm

