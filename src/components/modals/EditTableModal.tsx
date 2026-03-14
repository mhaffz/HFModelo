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
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-700/60 to-indigo-700/60 border-b border-slate-700">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <span className="text-lg">🗂️</span> Editar Tabela
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Table name */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nome da Tabela</label>
            <div className="flex gap-2">
              <input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="flex-1 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                placeholder="NomeDaTabela"
              />
            </div>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">Atributos</label>
              <button
                onClick={() =>
                  addAttribute(tableId, { name: 'novo_campo', type: 'VARCHAR' })
                }
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>

            <div className="space-y-2">
              {table.attributes.map((attr) => (
                <div
                  key={attr.id}
                  className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700"
                >
                  {/* Name */}
                  <input
                    defaultValue={attr.name}
                    onBlur={(e) =>
                      updateAttribute(tableId, attr.id, { name: e.target.value })
                    }
                    className="flex-1 bg-transparent text-white text-xs font-mono focus:outline-none min-w-0"
                    placeholder="nome"
                  />

                  {/* Type */}
                  <select
                    value={attr.type}
                    onChange={(e) =>
                      updateAttribute(tableId, attr.id, { type: e.target.value as AttributeType })
                    }
                    className="bg-slate-700 text-slate-300 text-xs rounded px-2 py-1 border border-slate-600 focus:outline-none focus:border-violet-500"
                  >
                    {ATTRIBUTE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  {/* PK toggle */}
                  <button
                    title="Primary Key"
                    onClick={() =>
                      updateAttribute(tableId, attr.id, {
                        isPrimaryKey: !attr.isPrimaryKey,
                      })
                    }
                    className={`p-1 rounded transition-colors ${
                      attr.isPrimaryKey
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-slate-600 hover:text-amber-400'
                    }`}
                  >
                    <Key size={12} />
                  </button>

                  {/* FK toggle */}
                  <button
                    title="Foreign Key"
                    onClick={() =>
                      updateAttribute(tableId, attr.id, {
                        isForeignKey: !attr.isForeignKey,
                      })
                    }
                    className={`p-1 rounded transition-colors ${
                      attr.isForeignKey
                        ? 'text-blue-400 bg-blue-400/10'
                        : 'text-slate-600 hover:text-blue-400'
                    }`}
                  >
                    <Link size={12} />
                  </button>

                  {/* NOT NULL toggle */}
                  <button
                    title="NOT NULL"
                    onClick={() =>
                      updateAttribute(tableId, attr.id, {
                        isNotNull: !attr.isNotNull,
                      })
                    }
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                      attr.isNotNull
                        ? 'bg-slate-600 text-slate-200'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    NN
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => removeAttribute(tableId, attr.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {table.attributes.length === 0 && (
                <p className="text-center text-slate-600 text-xs py-4">
                  Nenhum atributo. Clique em "Adicionar".
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-4 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  )
}
