import { useRef } from 'react'
import {
  Plus,
  Trash2,
  Download,
  Upload,
  Table2,
} from 'lucide-react'
import { useDiagramStore } from '../../store/useDiagramStore'


export function Sidebar() {
  const {
    tables,
    relationships,
    workspaces,
    activeWorkspaceId,
    setSchema,
    clearDiagram,
    addTable,
    setError,
    createWorkspace,
    switchWorkspace,
    deleteWorkspace,
    renameWorkspace,
  } = useDiagramStore()


  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = JSON.stringify({ tables, relationships }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // Custom extension
    a.download = 'diagrama.hfmodelo'
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
        if (!schema.tables) throw new Error('Formato inválido')
        setSchema(schema)
      } catch {
        setError('Arquivo .hfmodelo inválido ou corrompido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }


  return (
    <aside className="w-72 shrink-0 h-full bg-pastel-surface dark:bg-dark-surface border-r border-pastel-border dark:border-dark-border flex flex-col overflow-hidden transition-colors duration-300">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-pastel dark:scrollbar-thumb-dark-border p-4 space-y-5">

        {/* ── Workspaces ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-pastel-text dark:text-dark-text uppercase tracking-wider">
                Workspaces
              </span>
            </div>
            <button
              onClick={() => createWorkspace(`Workspace ${workspaces.length + 1}`)}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 p-1 rounded-md hover:bg-primary-50 dark:hover:bg-dark-surface transition-colors"
              title="Novo Workspace"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                  activeWorkspaceId === ws.id
                    ? 'border-primary-400 dark:border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-transparent hover:border-pastel-border dark:hover:border-dark-border hover:bg-white/50 dark:hover:bg-dark-panel/50 cursor-pointer'
                }`}
                onClick={() => {
                  if (activeWorkspaceId !== ws.id) switchWorkspace(ws.id)
                }}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <input
                    type="text"
                    value={ws.name}
                    onChange={(e) => renameWorkspace(ws.id, e.target.value)}
                    className={`w-full bg-transparent text-sm font-medium focus:outline-none focus:text-primary-600 dark:focus:text-primary-400 ${
                      activeWorkspaceId === ws.id
                        ? 'text-primary-900 dark:text-dark-text'
                        : 'text-pastel-text dark:text-dark-muted'
                    }`}
                    onClick={(e) => e.stopPropagation()} // allows selecting input without toggling optionally
                  />
                  <div className="text-[9px] text-pastel-muted dark:text-dark-muted/50 mt-0.5">
                    {ws.tables.length} tabelas
                  </div>
                </div>
                {workspaces.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Deletar este workspace?')) deleteWorkspace(ws.id)
                    }}
                    className="p-1.5 text-pastel-muted hover:text-red-500 hover:bg-white dark:hover:bg-red-950/30 rounded-md transition-all shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-pastel-border dark:border-dark-border" />

        {/* ── Table Tools ── */}
        <section className="space-y-3">

          <div className="flex items-center gap-2">
            <Table2 size={14} className="text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-semibold text-pastel-text dark:text-dark-text uppercase tracking-wider">
              Ferramentas
            </span>
          </div>


          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addTable()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-panel hover:bg-pastel-panel dark:hover:bg-dark-surface border border-pastel-border dark:border-dark-border text-pastel-text dark:text-dark-text text-xs rounded-lg transition-all"
            >
              <Plus size={13} className="text-primary-500 dark:text-primary-400" /> Tabela
            </button>
            <button
              onClick={() => {
                if (confirm('Limpar diagrama?')) clearDiagram()
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-panel hover:bg-red-50 dark:hover:bg-red-950/30 border border-pastel-border dark:border-dark-border text-pastel-text dark:text-dark-text hover:text-red-600 dark:hover:text-red-400 text-xs rounded-lg transition-all"
            >
              <Trash2 size={13} className="text-red-400" /> Limpar
            </button>
            <button
              onClick={handleExport}
              disabled={tables.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-panel hover:bg-pastel-panel dark:hover:bg-dark-surface border border-pastel-border dark:border-dark-border text-pastel-text dark:text-dark-text text-xs rounded-lg transition-all disabled:opacity-40"
            >
              <Download size={13} className="text-primary-500 dark:text-primary-400" /> Exportar
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-panel hover:bg-pastel-panel dark:hover:bg-dark-surface border border-pastel-border dark:border-dark-border text-pastel-text dark:text-dark-text text-xs rounded-lg transition-all"
            >
              <Upload size={13} className="text-primary-500 dark:text-primary-400" /> Importar
            </button>
            <input ref={fileInputRef} type="file" accept=".hfmodelo,.json" className="hidden" onChange={handleImport} />
          </div>

        </section>

        <div className="border-t border-pastel-border dark:border-dark-border" />

        {/* ── Stats ── */}
        <section className="col-span-2 grid grid-cols-2 gap-2">

          <div className="bg-white dark:bg-dark-panel border border-pastel-border dark:border-dark-border rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-primary-500 dark:text-primary-400">{tables.length}</div>
            <div className="text-[10px] text-pastel-muted dark:text-dark-muted uppercase font-bold tracking-wider">Tabelas</div>
          </div>
          <div className="bg-white dark:bg-dark-panel border border-pastel-border dark:border-dark-border rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-primary-600 dark:text-primary-500">{relationships.length}</div>
            <div className="text-[10px] text-pastel-muted dark:text-dark-muted uppercase font-bold tracking-wider">Conexões</div>
          </div>
        </section>

        <div className="border-t border-pastel-border dark:border-dark-border" />

      </div>
    </aside>

  )
}
