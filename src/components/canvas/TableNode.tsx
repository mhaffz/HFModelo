import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Key, Link, Hash, Type, Calendar, ToggleLeft, FileJson, Pencil, Trash2, Plus } from 'lucide-react'
import type { Table, Attribute } from '../../types/diagram'
import { useDiagramStore } from '../../store/useDiagramStore'

// ─── Type Icon Map ────────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: string }) {
  const t = type.toUpperCase()
  if (t.includes('INT') || t.includes('DECIMAL') || t.includes('FLOAT')) {
    return <Hash size={10} className="text-blue-400 shrink-0" />
  }
  if (t.includes('VARCHAR') || t.includes('TEXT') || t.includes('CHAR')) {
    return <Type size={10} className="text-green-400 shrink-0" />
  }
  if (t.includes('DATE') || t.includes('TIME')) {
    return <Calendar size={10} className="text-yellow-400 shrink-0" />
  }
  if (t === 'BOOLEAN') {
    return <ToggleLeft size={10} className="text-purple-400 shrink-0" />
  }
  if (t === 'JSON') {
    return <FileJson size={10} className="text-orange-400 shrink-0" />
  }
  return <Hash size={10} className="text-slate-400 shrink-0" />
}

// ─── Attribute Row ────────────────────────────────────────────────────────────

function AttributeRow({
  attr,
  onRemove,
}: {
  attr: Attribute
  onRemove: (attrId: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`group flex items-center gap-1.5 px-3 py-1 text-xs transition-colors ${
        attr.isPrimaryKey
          ? 'bg-amber-900/20 border-l-2 border-amber-400'
          : attr.isForeignKey
          ? 'bg-blue-900/20 border-l-2 border-blue-400'
          : 'border-l-2 border-transparent'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Key indicator */}
      {attr.isPrimaryKey && <Key size={10} className="text-amber-400 shrink-0" />}
      {attr.isForeignKey && !attr.isPrimaryKey && (
        <Link size={10} className="text-blue-400 shrink-0" />
      )}
      {!attr.isPrimaryKey && !attr.isForeignKey && (
        <span className="w-[10px] shrink-0" />
      )}

      {/* Name */}
      <span
        className={`flex-1 font-mono truncate ${
          attr.isPrimaryKey ? 'text-amber-300 font-semibold' : 'text-slate-200'
        }`}
      >
        {attr.name}
      </span>

      {/* Constraints badges */}
      {attr.isNotNull && (
        <span className="text-[9px] text-slate-500 shrink-0">NN</span>
      )}
      {attr.isUnique && !attr.isPrimaryKey && (
        <span className="text-[9px] text-indigo-400 shrink-0">UQ</span>
      )}

      {/* Type */}
      <div className="flex items-center gap-0.5 shrink-0">
        <TypeIcon type={attr.type} />
        <span className="text-[10px] text-slate-400 font-mono">{attr.type}</span>
      </div>

      {/* Remove button (shown on hover) */}
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(attr.id)
          }}
          className="shrink-0 text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={9} />
        </button>
      )}
    </div>
  )
}

// ─── TableNode ────────────────────────────────────────────────────────────────

export type TableNodeData = Table & {
  onEdit: (tableId: string) => void
}

function TableNodeComponent({ data, selected, dragging }: NodeProps<TableNodeData>) {
  const { removeTable, removeAttribute, addAttribute } = useDiagramStore()

  const handleAddAttr = () => {
    const name = prompt('Nome do atributo:')
    if (!name) return
    const type = prompt('Tipo (VARCHAR, INT, BOOLEAN, etc):') || 'VARCHAR'
    addAttribute(data.id, { name, type })
  }

  return (
    <>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-indigo-400 !bg-slate-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-violet-400 !bg-slate-900"
      />

      <div
        className={`
          min-w-[240px] max-w-[320px] rounded-xl overflow-hidden shadow-2xl
          border transition-all duration-200
          ${
            selected
              ? 'border-violet-400 shadow-violet-500/30'
              : 'border-slate-700/60 shadow-black/40'
          }
          ${dragging ? 'opacity-50 scale-[1.02] border-dashed border-violet-500/50 cursor-grabbing' : 'opacity-100 cursor-grab'}
          bg-gradient-to-b from-slate-800 to-slate-900
        `}
      >
        {/* Header */}
        <div
          className={`
            px-3 py-2 flex items-center justify-between gap-2
            bg-gradient-to-r from-violet-600/80 to-indigo-600/80
            border-b border-slate-700/50
          `}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-white font-semibold text-sm truncate font-mono">
              {data.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                data.onEdit(data.id)
              }}
              className="p-1 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              title="Editar tabela"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Remover tabela "${data.name}"?`)) {
                  removeTable(data.id)
                }
              }}
              className="p-1 rounded hover:bg-red-500/40 text-white/70 hover:text-red-300 transition-colors"
              title="Remover tabela"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Attribute Count Badge */}
        <div className="px-3 py-1 bg-slate-800/70 border-b border-slate-700/30 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            {data.attributes.length} atributo{data.attributes.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAddAttr()
            }}
            className="flex items-center gap-0.5 text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Plus size={10} />
            Atributo
          </button>
        </div>

        {/* Attributes List */}
        <div className="divide-y divide-slate-700/30 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
          {data.attributes.map((attr) => (
            <AttributeRow
              key={attr.id}
              attr={attr}
              onRemove={(attrId) => removeAttribute(data.id, attrId)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export const TableNode = memo(TableNodeComponent)
