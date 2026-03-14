import { useState, useRef } from 'react'
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Settings,
  Database,
  Plus,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  Table2,
  Workflow,
} from 'lucide-react'
import { useDiagramStore } from '../../store/useDiagramStore'
import { generateDiagramFromPrompt } from '../../services/aiService'
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

const EXAMPLE_PROMPTS = [
  'Sistema de e-commerce com produtos, categorias, pedidos, clientes e itens de pedido',
  'Blog com usuários, posts, comentários, tags e categorias',
  'Sistema hospitalar com pacientes, médicos, consultas, prescri­ções e exames',
  'App de delivery com restaurantes, cardápio, pedidos, entregadores e avaliações',
]

export function Sidebar() {
  const {
    tables,
    relationships,
    aiConfig,
    isGenerating,
    error,
    setSchema,
    clearDiagram,
    addTable,
    setAIConfig,
    setGenerating,
    setError,
  } = useDiagramStore()

  const [prompt, setPrompt] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── AI Generation ───────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setError(null)
    try {
      const schema = await generateDiagramFromPrompt(prompt.trim(), aiConfig)
      setSchema(schema)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setGenerating(false)
    }
  }

  // ── Export/Import JSON ──────────────────────────────────────────────────────
  const handleExport = () => {
    const data = JSON.stringify({ tables, relationships }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hfmodelo-diagram.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const schema = JSON.parse(ev.target?.result as string)
        if (!schema.tables) throw new Error('JSON inválido')
        setSchema(schema)
      } catch {
        setError('Arquivo JSON inválido ou corrompido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <aside className="w-72 shrink-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      {/* Branding */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Database size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-tight tracking-tight">HFModelo</h1>
          <p className="text-slate-500 text-[11px]">DB Designer com IA</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 p-4 space-y-4">

        {/* ── AI Panel ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Gerar com IA
            </span>
          </div>

          {/* Prompt area */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleGenerate()
              }}
              placeholder="Descreva o banco de dados que você precisa... Ex: sistema de e-commerce com usuários, produtos e pedidos"
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-3 resize-none focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600"
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-slate-600">Ctrl+Enter</span>
          </div>

          {/* Examples */}
          <div>
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showExamples ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Ver exemplos de prompt
            </button>
            {showExamples && (
              <div className="mt-2 space-y-1">
                {EXAMPLE_PROMPTS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(ex)
                      setShowExamples(false)
                    }}
                    className="w-full text-left text-[11px] text-slate-400 hover:text-violet-300 hover:bg-violet-900/20 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-violet-800/40"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all
              bg-gradient-to-r from-violet-600 to-indigo-600 text-white
              hover:from-violet-500 hover:to-indigo-500
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
          >
            {isGenerating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Gerando diagrama...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Gerar Diagrama
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-xl p-3">
              <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-slate-800" />

        {/* ── Table Tools ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Table2 size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Ferramentas
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addTable()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
            >
              <Plus size={13} /> Nova Tabela
            </button>
            <button
              onClick={() => {
                if (confirm('Limpar todo o diagrama?')) clearDiagram()
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-red-900/30 border border-slate-700 hover:border-red-700/50 text-slate-300 hover:text-red-400 text-xs rounded-lg transition-colors"
            >
              <Trash2 size={13} /> Limpar
            </button>
            <button
              onClick={handleExport}
              disabled={tables.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} /> Exportar JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
            >
              <Upload size={13} /> Importar JSON
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-slate-800" />

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-violet-400">{tables.length}</div>
            <div className="text-[11px] text-slate-500">Tabelas</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-indigo-400">{relationships.length}</div>
            <div className="text-[11px] text-slate-500">Relacionamentos</div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-slate-800" />

        {/* ── AI Settings ── */}
        <section>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
          >
            <div className="flex items-center gap-2">
              <Settings size={13} />
              <span className="font-semibold uppercase tracking-wider">Configurações IA</span>
            </div>
            {showSettings ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showSettings && (
            <div className="mt-3 space-y-3">
              {/* Provider */}
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Provedor</label>
                <select
                  value={aiConfig.provider}
                  onChange={(e) => {
                    const provider = e.target.value as AIProvider
                    setAIConfig({
                      provider,
                      model: PROVIDER_MODELS[provider][0],
                    })
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                >
                  <option value="gemini">🤖 Google Gemini</option>
                  <option value="openai">⚡ OpenAI</option>
                  <option value="openrouter">🌐 OpenRouter</option>
                  <option value="ollama">🦙 Ollama (local)</option>
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="text-[11px] text-slate-500 mb-1 block">Modelo</label>
                <select
                  value={aiConfig.model}
                  onChange={(e) => setAIConfig({ model: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                >
                  {PROVIDER_MODELS[aiConfig.provider].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* API Key */}
              {aiConfig.provider !== 'ollama' && (
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">API Key</label>
                  <input
                    type="password"
                    value={aiConfig.apiKey ?? ''}
                    onChange={(e) => setAIConfig({ apiKey: e.target.value })}
                    placeholder={aiConfig.provider === 'gemini' ? 'AIza...' : 'sk-...'}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              )}

              {/* Ollama Base URL */}
              {aiConfig.provider === 'ollama' && (
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">URL do Ollama</label>
                  <input
                    value={aiConfig.baseUrl ?? 'http://localhost:11434'}
                    onChange={(e) => setAIConfig({ baseUrl: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              )}

              {aiConfig.provider !== 'ollama' && (
                <p className="text-[10px] text-slate-600">
                  Sua chave é armazenada apenas na memória desta sessão. Nunca é enviada para nossos servidores.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Relations hint */}
        <div className="border-t border-slate-800 pt-3">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <Workflow size={12} className="text-violet-400" />
              <span className="text-[11px] font-semibold text-slate-400">Dica</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Arraste de uma porta <span className="text-violet-400">●</span> para outra para criar relacionamentos. Duplo clique em uma aresta para removê-la.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
