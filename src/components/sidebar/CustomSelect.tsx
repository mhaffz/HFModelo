import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  label?: string
}

export function CustomSelect({ value, onChange, options, label }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-primary-400 dark:text-dark-muted mb-2 block uppercase tracking-[0.15em] ml-1">
          {label}
        </label>

      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white dark:bg-dark-panel border text-left flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 shadow-sm
          ${isOpen 
            ? 'border-primary-400 dark:border-primary-600 ring-4 ring-primary-100 dark:ring-primary-900/30 shadow-lg shadow-primary-900/5 translate-y-[-1px]' 
            : 'border-primary-100/80 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md hover:translate-y-[-1px]'}
        `}
      >
        <span className="text-[11px] font-bold text-primary-900 dark:text-dark-text truncate tracking-tight">
          {selectedOption?.label || value}
        </span>

        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown 
            size={14} 
            strokeWidth={3} 
            className={`${isOpen ? 'text-primary-600' : 'text-primary-300'} group-hover:text-primary-600`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-dark-surface border border-primary-100/80 dark:border-dark-border rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-black/50 overflow-hidden animate-fade-in origin-top">

          <div className="max-h-64 overflow-y-auto scrollbar-none py-1.5 px-1.5">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl mb-1 last:mb-0 transition-all flex items-center justify-between group border
                  ${option.value === value 
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-400 dark:border-primary-600 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-primary-100/30 dark:hover:bg-primary-900/10'}
                `}
              >
                <span className={`truncate pr-4 text-[11px] font-bold tracking-tight ${option.value === value ? 'text-primary-950 dark:text-primary-400' : 'text-primary-700 dark:text-dark-muted'}`}>
                  {option.label}
                </span>
                {option.value === value ? (
                  <Check size={14} strokeWidth={3} className="text-primary-600 dark:text-primary-400 shrink-0" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-100 dark:bg-dark-border group-hover:bg-primary-300 dark:group-hover:bg-primary-700 transition-colors shrink-0" />
                )}
              </button>

            ))}
          </div>
        </div>
      )}
    </div>
  )
}
