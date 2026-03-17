import { MonitorOff, ChevronRight } from 'lucide-react'

export function ResponsiveBlocker() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-white dark:bg-dark-bg text-center">
      <div className="max-w-md w-full space-y-8 animate-scale-up">
        {/* Icon with animated background */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/20 rounded-[32px] rotate-6 animate-pulse" />
          <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/10 rounded-[32px] -rotate-3" />
          <MonitorOff size={44} className="relative text-primary-600 dark:text-primary-400" />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-primary-900 dark:text-dark-text tracking-tight">
            Oops! Tela muito pequena
          </h2>
          <p className="text-primary-600/70 dark:text-dark-muted leading-relaxed font-medium">
            O HFModelo foi projetado para modelagem complexa de dados. Para garantir a melhor experiência, é necessário estar em uma tela de 
            <span className="text-primary-900 dark:text-dark-text font-bold"> pelo menos 1024px</span> (Tablet no modo paisagem ou Desktop).
          </p>
        </div>

        {/* Tips / Action */}
        <div className="bg-primary-50/50 dark:bg-dark-panel border border-primary-100/50 dark:border-dark-border rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-black text-primary-400 dark:text-dark-muted uppercase tracking-widest">
            <ChevronRight size={14} className="text-primary-500" /> Dica rápida
          </div>
          <p className="text-xs text-primary-800 dark:text-dark-text/80 font-medium">
            Tente rotacionar seu dispositivo para o modo paisagem ou abra em um computador para continuar modelando.
          </p>
        </div>

        {/* Branding Footer */}
        <div className="pt-4 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-primary-100 dark:bg-dark-border" />
          <span className="text-[10px] font-bold text-primary-300 dark:text-dark-muted uppercase tracking-[0.2em]">
            HFModelo
          </span>
          <div className="h-px w-8 bg-primary-100 dark:bg-dark-border" />
        </div>
      </div>
    </div>
  )
}
