import { Database, Layers, Network } from 'lucide-react'
import { useDiagramStore } from '../../store/useDiagramStore'

export function DiagramNavigator() {
  const { diagramType, setDiagramType } = useDiagramStore()

  const options = [
    { id: 'hfmodelo', label: 'HFModelo', icon: Database },
    { id: 'conceptual', label: 'Conceitual', icon: Layers },
    { id: 'logical', label: 'Lógico', icon: Network },
  ] as const

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[50] flex items-center justify-center pointer-events-auto">
      <nav className="flex items-center p-1.5 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-primary-100/50 dark:border-dark-border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        {options.map((option) => {
          const Icon = option.icon
          const isActive = diagramType === option.id

          return (
            <button
              key={option.id}
              onClick={() => setDiagramType(option.id)}
              className={`
                group relative flex items-center justify-center h-10 px-4 rounded-xl transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-primary-900 dark:bg-primary-800 text-white shadow-lg shadow-primary-900/20' 
                  : 'text-primary-400 dark:text-dark-muted hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
                }
              `}
              title={option.label}
            >
              {/* Icon */}
              <Icon 
                size={18} 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
              />

              {/* Label - Smooth slide in effect inspired by Model 1 */}
              <div className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isActive ? 'max-w-[100px] ml-2 opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:ml-2 group-hover:opacity-100'}
              `}>
                <span className="text-[13px] font-bold whitespace-nowrap tracking-tight">
                  {option.label}
                </span>
              </div>

              {/* Active Indicator bar at bottom - Model 2/3 influence */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-400 dark:bg-primary-500 rounded-full animate-bounce-subtle" />
              )}
            </button>
          )
        })}
      </nav>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translate(-50%, 0); opacity: 0.6; }
          50% { transform: translate(-50%, -2px); opacity: 1; }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}} />
    </div>
  )
}
