import { useState } from 'react'
import { X, Plus, Trash2, Key, Link } from 'lucide-react'
import { useDiagramStore } from '../../store/useDiagramStore'
import type { AttributeType } from '../../types/diagram'

const ATTRIBUTE_TYPES: AttributeType[] = [
  'INT', 'BIGINT', 'SMALLINT', 'DECIMAL', 'FLOAT',
  'VARCHAR', 'TEXT', 'CHAR',
  'BOOLEAN',
  'DATE', 'DATETIME', 'TIMESTAMP',
  'UUID', 'JSON',
]

interface Props {
  tableId: string
  onClose: () => void
}

export function EditTableModal({ tableId, onClose }: Props) {
  const { tables, updateTable, addAttribute, updateAttribute, removeAttribute } = useDiagramStore()
  const table = tables.find((t) => t.id === tableId)

  const [tableName, setTableName] = useState(table?.name ?? '')

  if (!table) return null

  const handleSaveName = () => {
    if (tableName.trim()) {
      updateTable(tableId, { name: tableName.trim() })
    }
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-dark-surface border border-pastel-border dark:border-dark-border rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary-50 dark:bg-dark-panel border-b border-primary-200/60 dark:border-dark-border">
          <h2 className="text-primary-900 dark:text-dark-text font-bold text-base flex items-center gap-2">
            <span className="text-lg drop-shadow-sm">🗂️</span> Editar Tabela
          </h2>

          <button onClick={onClose} className="text-pastel-muted dark:text-dark-muted hover:text-primary-600 dark:hover:text-dark-text p-1.5 rounded-lg hover:bg-primary-100/50 dark:hover:bg-dark-surface transition-colors">
            <X size={18} strokeWidth={2.5} />
          </button>

        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-pastel">
          {/* Table name */}
          <div>
            <label className="text-[11px] font-bold text-pastel-muted dark:text-dark-muted uppercase tracking-wider mb-1.5 block">Nome da Tabela</label>
            <div className="flex gap-2">
              <input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="flex-1 bg-pastel-panel/50 dark:bg-dark-panel/50 border border-pastel-border dark:border-dark-border text-pastel-text dark:text-dark-text text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-400 dark:focus:border-primary-700 focus:bg-white dark:focus:bg-dark-surface focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all font-mono font-medium shadow-sm"
                placeholder="NomeDaTabela"
              />
            </div>
          </div>


          {/* Attributes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-bold text-pastel-muted dark:text-dark-muted uppercase tracking-wider">Atributos</label>
              <button
                onClick={() =>
                  addAttribute(tableId, { name: 'novo_campo', type: 'VARCHAR' })
                }
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 px-2 py-1 rounded-md"
              >
                <Plus size={12} strokeWidth={2.5} /> Adicionar
              </button>
            </div>


            <div className="space-y-2">
              {table.attributes.map((attr) => (
                <div
                  key={attr.id}
                  className="flex items-center gap-2 bg-white dark:bg-dark-panel rounded-xl px-3 py-2.5 border border-pastel-border dark:border-dark-border shadow-sm hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
                >

                  {/* Name */}
                  <div className="flex-1">
                    <input
                      defaultValue={attr.name}
                      onBlur={(e) =>
                        updateAttribute(tableId, attr.id, { name: e.target.value })
                      }
                      className="w-full bg-transparent text-pastel-text dark:text-dark-text text-sm font-mono font-medium focus:outline-none focus:text-primary-700 dark:focus:text-primary-400 min-w-0"
                      placeholder="nome"
                    />
                  </div>


                  {/* Type */}
                  <select
                    value={attr.type}
                    onChange={(e) =>
                      updateAttribute(tableId, attr.id, { type: e.target.value as AttributeType })
                    }
                    className="bg-pastel-panel/50 dark:bg-dark-surface text-pastel-muted dark:text-dark-text font-bold tracking-wide font-mono text-[10px] rounded-md px-2 py-1.5 border border-pastel-border dark:border-dark-border focus:outline-none focus:border-primary-400 dark:focus:border-primary-700 focus:text-primary-700"
                  >
                    {ATTRIBUTE_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-white dark:bg-dark-surface">{t}</option>
                    ))}
                  </select>


                  <div className="flex items-center gap-1 border-l border-pastel-border dark:border-dark-border pl-2 ml-1">

                    {/* PK toggle */}
                    <button
                      title="Primary Key"
                      onClick={() =>
                        updateAttribute(tableId, attr.id, {
                          isPrimaryKey: !attr.isPrimaryKey,
                        })
                      }
                      className={`p-1.5 rounded-md transition-all ${
                        attr.isPrimaryKey
                          ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 shadow-inner'
                          : 'text-pastel-muted dark:text-dark-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10'
                      }`}

                    >
                      <Key size={14} />
                    </button>

                    {/* FK toggle */}
                    <button
                      title="Foreign Key"
                      onClick={() =>
                        updateAttribute(tableId, attr.id, {
                          isForeignKey: !attr.isForeignKey,
                        })
                      }
                      className={`p-1.5 rounded-md transition-all ${
                        attr.isForeignKey
                          ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 shadow-inner'
                          : 'text-pastel-muted dark:text-dark-muted hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                      }`}

                    >
                      <Link size={14} />
                    </button>

                    {/* NOT NULL toggle */}
                    <button
                      title="NOT NULL"
                      onClick={() =>
                        updateAttribute(tableId, attr.id, {
                          isNotNull: !attr.isNotNull,
                        })
                      }
                      className={`text-[9px] px-1.5 py-1 rounded-md font-mono font-bold transition-all ${
                        attr.isNotNull
                          ? 'bg-pastel-muted text-white shadow-inner'
                          : 'text-pastel-muted hover:text-pastel-text hover:bg-pastel-panel border border-transparent'
                      }`}
                    >
                      NN
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => removeAttribute(tableId, attr.id)}
                      className="text-pastel-muted dark:text-dark-muted hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all p-1.5 rounded-md ml-1"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>
                </div>
              ))}

              {table.attributes.length === 0 && (
                <div className="flex flex-col items-center justify-center space-y-2 py-6 bg-pastel-bg/50 dark:bg-dark-bg/30 border border-dashed border-pastel-border dark:border-dark-border rounded-xl">
                  <span className="text-xl">👻</span>
                  <p className="text-pastel-muted dark:text-dark-muted text-xs font-medium">
                    Nenhum atributo. Clique em "Adicionar"
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 bg-pastel-panel/30 dark:bg-dark-panel/50 border-t border-pastel-border dark:border-dark-border">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-400 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md shadow-primary-200 dark:shadow-black/20 transform hover:-translate-y-0.5"
          >

            Concluído
          </button>
        </div>
      </div>
    </div>
  )
}
