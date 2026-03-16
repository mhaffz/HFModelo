import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Key, Link, Hash, Type, Calendar, ToggleLeft, FileJson, Pencil, Trash2, Plus } from 'lucide-react'
import type { Table, Attribute } from '../../types/diagram'
import { useDiagramStore } from '../../store/useDiagramStore'
import { ConfirmModal } from '../modals/ConfirmModal'
import { PromptModal } from '../modals/PromptModal'

// ─── Type Icon Map ────────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: string }) {
  const t = type.toUpperCase()
  if (t.includes('INT') || t.includes('DECIMAL') || t.includes('FLOAT')) {
    return <Hash size={10} className="text-blue-500 shrink-0" />
  }
  if (t.includes('VARCHAR') || t.includes('TEXT') || t.includes('CHAR')) {
    return <Type size={10} className="text-emerald-500 shrink-0" />
  }
  if (t.includes('DATE') || t.includes('TIME')) {
    return <Calendar size={10} className="text-amber-500 shrink-0" />
  }
  if (t === 'BOOLEAN') {
    return <ToggleLeft size={10} className="text-purple-500 shrink-0" />
  }
  if (t === 'JSON') {
    return <FileJson size={10} className="text-orange-500 shrink-0" />
  }
  return <Hash size={10} className="text-pastel-muted shrink-0" />
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
      className={`group flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
        attr.isPrimaryKey
          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-l-2 border-amber-400'
          : attr.isForeignKey
          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400'
          : 'border-l-2 border-transparent hover:bg-pastel-panel/30 dark:hover:bg-dark-panel'
      }`}

      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Key indicator */}
      {attr.isPrimaryKey && <Key size={10} className="text-amber-500 shrink-0" />}
      {attr.isForeignKey && !attr.isPrimaryKey && (
        <Link size={10} className="text-blue-500 shrink-0" />
      )}
      {!attr.isPrimaryKey && !attr.isForeignKey && (
        <span className="w-[10px] shrink-0" />
      )}

      {/* Name */}
      <span
        className={`flex-1 font-mono truncate ${
          attr.isPrimaryKey ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-pastel-text dark:text-dark-text font-medium'
        }`}
      >

        {attr.name}
      </span>

      {/* Constraints badges */}
      {attr.isNotNull && (
        <span className="text-[9px] font-bold text-pastel-muted shrink-0">NN</span>
      )}
      {attr.isUnique && !attr.isPrimaryKey && (
        <span className="text-[9px] font-bold text-indigo-500 shrink-0">UQ</span>
      )}

      {/* Type */}
      <div className="flex items-center gap-1 shrink-0 bg-pastel-panel dark:bg-dark-surface px-1.5 py-0.5 rounded-md border border-pastel-border/50 dark:border-dark-border">
        <TypeIcon type={attr.type} />
        <span className="text-[9px] text-pastel-muted dark:text-dark-muted font-bold font-mono tracking-wider">{attr.type}</span>
      </div>


      {/* Remove button (shown on hover) */}
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(attr.id)
          }}
          className="shrink-0 text-red-400 hover:text-red-600 transition-colors ml-1 p-0.5 hover:bg-red-50 rounded"
        >
          <Trash2 size={10} />
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddAttrPrompt, setShowAddAttrPrompt] = useState(false)

  const handleAddAttr = (name: string) => {
    addAttribute(data.id, { name, type: 'VARCHAR' })
    setShowAddAttrPrompt(false)
  }

  return (
    <>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !border-2 !border-primary-400 !bg-white hover:!bg-primary-100 transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !border-2 !border-primary-400 !bg-white hover:!bg-primary-100 transition-colors"
      />

      <div
        className={`
          min-w-[240px] max-w-[320px] rounded-2xl overflow-hidden shadow-sm
          border transition-all duration-200
          ${
            selected
              ? 'border-primary-400 shadow-lg shadow-primary-200 dark:shadow-primary-900/30 ring-2 ring-primary-100/50 dark:ring-primary-900/30'
              : 'border-pastel-border dark:border-dark-border hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md'
          }
          ${dragging ? 'opacity-80 scale-[1.02] cursor-grabbing shadow-xl shadow-primary-200 dark:shadow-primary-900/40' : 'opacity-100 cursor-grab'}
          bg-white dark:bg-dark-surface
        `}

      >
        {/* Header */}
        <div
          className={`
            px-3 py-2.5 flex items-center justify-between gap-2
            bg-primary-50 dark:bg-primary-900/10 border-b border-primary-200/60 dark:border-primary-800/40
          `}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-400 shrink-0 shadow-inner" />
            <span className="text-primary-900 dark:text-dark-text font-bold text-[13px] truncate font-mono tracking-tight">
              {data.name}
            </span>
          </div>


          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                data.onEdit(data.id)
              }}
              className="p-1.5 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors"
              title="Editar tabela"
            >
              <Pencil size={12} strokeWidth={2.5} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(true)
              }}
              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-pastel-muted dark:text-dark-muted hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Remover tabela"
            >
              <Trash2 size={12} strokeWidth={2.5} />
            </button>

          </div>
        </div>

        {/* Attribute Count Badge */}
        <div className="px-3 py-1.5 bg-pastel-panel/30 dark:bg-dark-panel/30 border-b border-pastel-border/50 dark:border-dark-border/40 flex items-center justify-between">
          <span className="text-[10px] font-medium text-pastel-muted dark:text-dark-muted uppercase tracking-wider">
            {data.attributes.length} atributo{data.attributes.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowAddAttrPrompt(true)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-dark-panel border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 transition-colors"
          >
            <Plus size={10} strokeWidth={3} />
            ATRIB
          </button>
        </div>


        {/* Attributes List */}
        <div className="divide-y divide-pastel-border/40 dark:divide-dark-border/40 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-pastel dark:scrollbar-thumb-dark-border">
          {data.attributes.map((attr) => (
            <AttributeRow
              key={attr.id}
              attr={attr}
              onRemove={(attrId) => removeAttribute(data.id, attrId)}
            />
          ))}
          {data.attributes.length === 0 && (
            <div className="py-4 text-center text-xs text-pastel-muted dark:text-dark-muted bg-pastel-bg/50 dark:bg-dark-bg/30">
              Nenhum atributo
            </div>
          )}
        </div>

      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Remover Tabela"
          message={`Tem certeza que deseja remover a tabela "${data.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Remover"
          isDestructive
          onConfirm={() => {
            removeTable(data.id)
            setShowDeleteConfirm(false)
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showAddAttrPrompt && (
        <PromptModal
          title="Adicionar Atributo"
          label="Nome do Atributo"
          placeholder="ex: nome, id, data_criacao"
          onConfirm={handleAddAttr}
          onCancel={() => setShowAddAttrPrompt(false)}
        />
      )}
    </>
  )
}

export const TableNode = memo(TableNodeComponent)
