import { X, Sparkles } from 'lucide-react'
import { useDiagramStore } from '../../store/useDiagramStore'
import { CustomSelect } from '../sidebar/CustomSelect'
import type { AIProvider } from '../../types/diagram'

const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  ollama: ['llama3', 'mistral', 'codellama', 'llama3:70b'],
  openrouter: [
    'deepseek/deepseek-chat',
    'google/gemini-2.0-flash-001',
    'meta-llama/llama-3.3-70b-instruct',
    'openai/gpt-4o-mini',
  ],
}

const PROVIDER_LABELS: Record<AIProvider, string> = {
  gemini: '🤖 Google Gemini',
  openai: '⚡ OpenAI',
  openrouter: '🌐 OpenRouter',
  ollama: '🦙 Ollama (Local)',
}

interface AiSettingsModalProps {
  onClose: () => void
}

export function AiSettingsModal({ onClose }: AiSettingsModalProps) {
  const { aiConfig, setAIConfig } = useDiagramStore()

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-primary-950/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-[32px] shadow-[0_24px_80px_rgba(74,64,54,0.15)] dark:shadow-black/40 border border-primary-100/80 dark:border-dark-border overflow-hidden animate-scale-up">

        {/* Header */}
        <div className="bg-primary-50 dark:bg-dark-panel px-8 py-6 border-b border-primary-100/60 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-surface shadow-sm border border-primary-100 dark:border-dark-border flex items-center justify-center">
              <Sparkles size={18} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-primary-900 dark:text-dark-text font-bold text-lg leading-tight">Ajustes da IA</h2>
              <p className="text-[10px] text-primary-400 dark:text-dark-muted uppercase font-black tracking-widest">Configurações globais</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-dark-surface text-primary-300 hover:text-primary-600 dark:text-dark-muted dark:hover:text-dark-text transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>


        {/* Content */}
        <div className="p-8 space-y-6">
          <CustomSelect
            label="Motor de IA"
            value={aiConfig.provider}
            onChange={(val) => {
              const provider = val as AIProvider
              setAIConfig({
                provider,
                model: PROVIDER_MODELS[provider][0],
              })
            }}
            options={Object.keys(PROVIDER_LABELS).map((p) => ({
              value: p,
              label: PROVIDER_LABELS[p as AIProvider] || p,
            }))}
          />

          <CustomSelect
            label="Modelo do Sistema"
            value={aiConfig.model || ''}
            onChange={(model) => setAIConfig({ model })}
            options={PROVIDER_MODELS[aiConfig.provider].map((m) => ({
              value: m,
              label: m,
            }))}
          />

          {aiConfig.provider !== 'ollama' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary-400 dark:text-dark-muted ml-1 block uppercase tracking-widest">
                Chave de Acesso (API Key)
              </label>
              <input
                type="password"
                value={aiConfig.apiKey ?? ''}
                onChange={(e) => setAIConfig({ apiKey: e.target.value })}
                placeholder={aiConfig.provider === 'gemini' ? 'AIza...' : 'sk-...'}
                className="w-full bg-primary-50/50 dark:bg-dark-panel/50 border border-primary-100/50 dark:border-dark-border text-primary-900 dark:text-dark-text text-xs font-medium rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-300 dark:focus:border-primary-700 focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-primary-100/30 transition-all font-mono"
              />

            </div>
          )}

          {aiConfig.provider === 'ollama' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary-400 dark:text-dark-muted ml-1 block uppercase tracking-widest">
                URL do Servidor
              </label>
              <input
                value={aiConfig.baseUrl ?? 'http://localhost:11434'}
                onChange={(e) => setAIConfig({ baseUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full bg-primary-50/50 dark:bg-dark-panel/50 border border-primary-100/50 dark:border-dark-border text-primary-900 dark:text-dark-text text-xs font-medium rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-300 dark:focus:border-primary-700 focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-primary-100/30 transition-all font-mono"
              />

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-pastel-bg/30 dark:bg-primary-950/20 text-center">
            <p className="text-[10px] text-primary-400 dark:text-dark-muted font-bold uppercase tracking-widest">As alterações são salvas automaticamente</p>
        </div>

      </div>
    </div>
  )
}
