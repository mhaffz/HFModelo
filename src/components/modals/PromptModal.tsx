import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface Props {
  title: string
  label: string
  defaultValue?: string
  placeholder?: string
  confirmLabel?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function PromptModal({
  title,
  label,
  defaultValue = '',
  placeholder = '',
  confirmLabel = 'Salvar',
  onConfirm,
  onCancel,
}: Props) {
  const [value, setValue] = useState(defaultValue)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onCancel, 200)
  }

  const handleConfirm = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!value.trim()) return
    setIsClosing(true)
    setTimeout(() => onConfirm(value), 200)
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-sm bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden border border-primary-100 dark:border-dark-border transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary-900 dark:text-dark-text tracking-tight">
              {title}
            </h3>
            <button onClick={handleClose} className="text-primary-300 hover:text-primary-600 dark:hover:text-dark-text transition-colors">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
          
          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-primary-400 dark:text-dark-muted mb-1.5 block uppercase tracking-[0.15em] ml-1">
                {label}
              </label>
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-primary-50/50 dark:bg-dark-panel/50 border border-primary-100/50 dark:border-dark-border text-primary-900 dark:text-dark-text text-sm rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-400 dark:focus:border-primary-700 focus:bg-white dark:focus:bg-dark-panel focus:ring-4 focus:ring-primary-400/5 transition-all outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-sm font-bold text-primary-400 dark:text-dark-muted hover:text-primary-600 dark:hover:text-dark-text transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!value.trim()}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-primary-900 dark:bg-primary-800 hover:bg-primary-800 dark:hover:bg-primary-700 rounded-[18px] shadow-lg shadow-primary-900/10 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
              >
                {confirmLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}
