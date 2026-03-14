import { useState } from 'react'
import { Settings, Sparkles } from 'lucide-react'
import { useDiagramStore } from '../../store/useDiagramStore'
import { ThemeSwitch } from './ThemeSwitch'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setAiSettingsOpen } = useDiagramStore()

  return (
    <nav className="w-full h-16 bg-white dark:bg-dark-surface backdrop-blur-md border-b border-pastel-border dark:border-dark-border flex items-center justify-between px-6 shrink-0 z-50 transition-colors duration-300">
      <div className="flex items-center">
        <h1 className="text-primary-900 dark:text-dark-text font-extrabold text-xl leading-tight tracking-tighter">
          HFModelo
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitch />
        <div className="relative">
          <button
            onMouseEnter={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-panel text-primary-400 hover:text-primary-600 dark:text-dark-muted dark:hover:text-dark-text transition-all group"
          >
            <Settings 
              size={22} 
              className="transition-transform duration-700 group-hover:rotate-180" 
            />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div 
              onMouseLeave={() => setIsMenuOpen(false)}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-surface border border-primary-100 dark:border-dark-border rounded-2xl shadow-xl shadow-primary-900/5 overflow-hidden animate-fade-in py-1.5 z-[60]"
            >
              <button
                onClick={() => {
                  setAiSettingsOpen(true)
                  setIsMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-primary-700 dark:text-dark-text hover:bg-primary-50 dark:hover:bg-dark-panel transition-colors"
              >
                <Sparkles size={14} className="text-primary-400 dark:text-primary-500" />
                Ajustes da IA
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
