import { useRef, useState } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export default {
  title: 'UI/Modal/AccessibleModal',
}

export function BasicModal() {
  const [open, setOpen] = useState(false)
  const initialFocusRef = useRef<HTMLButtonElement>(null)
  const modalRef = useFocusTrap<HTMLDivElement>({
    isActive: open,
    initialFocusRef,
    onEscape: () => setOpen(false),
  })

  return (
    <div className="min-h-[200px] p-6">
      <button
        className="px-4 py-2 rounded bg-emerald-500 text-white"
        onClick={() => setOpen(true)}
      >
        Open modal
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="storybook-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false)
            }
          }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className="w-full max-w-md rounded-xl bg-white p-6 text-slate-900 shadow-xl"
          >
            <h2 id="storybook-modal-title" className="text-xl font-semibold mb-4">
              Focus trapped modal
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              Tabbing will cycle between the buttons and pressing escape will close the modal.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                ref={initialFocusRef}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded border border-slate-300"
              >
                Close
              </button>
              <button className="px-3 py-2 rounded bg-emerald-500 text-white">
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
