import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onCancel, 200)
  }

  const handleConfirm = () => {
    setIsClosing(true)
    setTimeout(onConfirm, 200)
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
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-500' 
                : 'bg-primary-50 dark:bg-primary-900/20 text-primary-500'
            }`}>
              {isDestructive ? <AlertTriangle size={20} /> : <div className="text-xl">💡</div>}
            </div>
            <h3 className="text-lg font-bold text-primary-900 dark:text-dark-text tracking-tight">
              {title}
            </h3>
          </div>
          
          <p className="text-sm text-primary-700/70 dark:text-dark-muted leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-6 py-4 bg-primary-50/50 dark:bg-dark-panel flex items-center gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-primary-400 dark:text-dark-muted hover:text-primary-600 dark:hover:text-dark-text transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-95 ${
              isDestructive
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none'
                : 'bg-primary-900 dark:bg-primary-800 hover:bg-primary-800 dark:hover:bg-primary-700 shadow-primary-900/10 dark:shadow-none'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
