import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/base.css'

import { useDiagramStore } from '../../store/useDiagramStore'
import { TableNode, type TableNodeData } from './TableNode'
import { EditTableModal } from '../modals/EditTableModal'
import type { Relationship } from '../../types/diagram'

import { CardinalityEdge } from './CardinalityEdge'
import { AiChatWidget } from '../chat/AiChatWidget'
import { ConfirmModal } from '../modals/ConfirmModal'
import { PromptModal } from '../modals/PromptModal'
import { ConnectionMode } from 'reactflow'


// ─── Node/Edge Types Registration ─────────────────────────────────────────────

const NODE_TYPES = { tableNode: TableNode }
const EDGE_TYPES = { cardinalityEdge: CardinalityEdge }

// ─── Relationship Type → Edge Style ──────────────────────────────────────────

function relationshipToEdgeStyle(rel: Relationship): Partial<Edge> {
  const baseStyle = {
    stroke: '#d4b896', // changed from indigo
    strokeWidth: 2.5,
  }

  // If it's a many-to-many relationship (implied by 'n' in both ends)
  const isNM = rel.sourceCardinality?.includes('n') && rel.targetCardinality?.includes('n')

  if (isNM) {
    return {
      style: { ...baseStyle, stroke: '#b68558' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#b68558' },
      markerStart: { type: MarkerType.ArrowClosed, color: '#b68558' },
    }
  }

  return {
    style: baseStyle,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d4b896' },
  }
}

// ─── DiagramCanvas ────────────────────────────────────────────────────────────

export function DiagramCanvas() {
  const { tables, relationships, updateTablePosition, addRelationship, removeRelationship, updateRelationship, appendSchema, setError, theme } =
    useDiagramStore()

  const [editingTableId, setEditingTableId] = useState<string | null>(null)

  // Modals state
  const [showRelDeleteConfirm, setShowRelDeleteConfirm] = useState<string | null>(null)
  const [showRelNamePrompt, setShowRelNamePrompt] = useState<Relationship | null>(null)
  const [showRelCardPrompt, setShowRelCardPrompt] = useState<Relationship | null>(null)

  // Map Zustand → React Flow nodes
  const rfNodes = useMemo<Node<TableNodeData>[]>(() => {
    return tables.map((table) => ({
      id: table.id,
      type: 'tableNode',
      position: table.position,
      data: {
        ...table,
        onEdit: (id: string) => setEditingTableId(id),
      },
      selected: false,
    }))
  }, [tables])

  // Map Zustand → React Flow edges
  const rfEdges = useMemo<Edge[]>(() => {
    return relationships.map((rel) => ({
      id: rel.id,
      source: rel.sourceTableId,
      target: rel.targetTableId,
      type: 'cardinalityEdge',
      data: {
        label: rel.label,
        sourceCardinality: rel.sourceCardinality,
        targetCardinality: rel.targetCardinality,
      },
      ...relationshipToEdgeStyle(rel),
    }))
  }, [relationships])

  const [, , onNodesChange] = useNodesState(rfNodes)
  const [, setEdges, onEdgesChange] = useEdgesState(rfEdges)

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes)

      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.dragging) {
          updateTablePosition(change.id, change.position)
        }
      })
    },
    [onNodesChange, updateTablePosition]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return
      addRelationship({
        sourceTableId: connection.source,
        targetTableId: connection.target,
        sourceCardinality: '(0,n)',
        targetCardinality: '(1,1)',
        label: '',
      })
      setEdges((eds) => addEdge({ ...connection, type: 'cardinalityEdge' }, eds))
    },
    [addRelationship, setEdges]
  )

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateTablePosition(node.id, node.position)
    },
    [updateTablePosition]
  )

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const rel = relationships.find((r) => r.id === edge.id)
      if (!rel) return

      const action = prompt(
        `Relacionamento: ${rel.label || 'sem nome'}\n` +
        `Cardinalidades: ${rel.sourceCardinality} - ${rel.targetCardinality}\n\n` +
        `O que deseja fazer?\n` +
        `1. Editar Nome\n` +
        `2. Editar Cardinalidades\n` +
        `3. Remover\n` +
        `Digite o número da opção:`
      )

      if (action === '1') {
        setShowRelNamePrompt(rel)
      } else if (action === '2') {
        setShowRelCardPrompt(rel)
      } else if (action === '3') {
        setShowRelDeleteConfirm(rel.id)
      }
    },
    [relationships]
  )

  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const file = event.dataTransfer.files?.[0]
      if (!file) return

      if (file.name.endsWith('.hfmodelo') || file.name.endsWith('.json')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          try {
            const schema = JSON.parse(ev.target?.result as string)
            if (!schema.tables) throw new Error('Formato inválido')

            const position = screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            })

            appendSchema(schema, position)
          } catch (e) {
            setError('Arquivo .hfmodelo inválido ou corrompido.')
          }
        }
        reader.readAsText(file)
      }
    },
    [screenToFlowPosition, appendSchema, setError]
  )

  return (
    <div className="w-full h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        connectionMode={ConnectionMode.Loose}
        snapToGrid
        snapGrid={[24, 24]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={null}
        className="bg-pastel-bg dark:bg-dark-bg transition-colors duration-300"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color={theme === 'dark' ? '#3d372e' : '#d4b896'}
          className="opacity-30"
        />
        <Controls
          className="!bg-white dark:!bg-dark-surface !border-primary-100 dark:!border-dark-border !border !shadow-2xl !shadow-primary-900/5 !rounded-2xl overflow-hidden 
            [&_button]:!bg-white dark:[&_button]:!bg-dark-surface [&_button]:!border-primary-50 dark:[&_button]:!border-dark-border [&_button]:!border-b last:[&_button]:!border-b-0
            [&_button]:!transition-colors [&_button:hover]:!bg-primary-50 dark:[&_button:hover]:!bg-dark-panel 
            [&_button]:!text-primary-400 dark:[&_button]:!text-dark-muted 
            [&_button:hover]:!text-primary-600 dark:[&_button:hover]:!text-primary-400
            [&_svg]:!fill-primary-600 dark:[&_svg]:!fill-dark-text"
          showInteractive={false}
        />


      </ReactFlow>

      {/* Empty state */}
      {tables.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary-200 blur-3xl opacity-20 rounded-full animate-pulse"></div>
            <div className="relative w-28 h-28 bg-white border border-primary-100 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary-900/10 rotate-3">
              <span className="text-5xl">📐</span>
            </div>
          </div>
          <h2 className="text-primary-900 dark:text-dark-text text-2xl font-black tracking-tight mb-2">Workspace Pronto</h2>
          <p className="text-primary-600/60 dark:text-dark-muted text-sm max-w-[280px] font-bold uppercase tracking-widest leading-loose">
            Comece adicionando uma tabela ou descreva seu modelo na lateral para a IA.
          </p>

        </div>
      )}

      {/* Edit Modal */}
      {editingTableId && (
        <EditTableModal
          tableId={editingTableId}
          onClose={() => setEditingTableId(null)}
        />
      )}

      {/* Floating AI Chat Widget */}
      <AiChatWidget />

      {/* Relationship Modals */}
      {showRelDeleteConfirm && (
        <ConfirmModal
          title="Remover Relacionamento"
          message="Tem certeza que deseja remover este relacionamento?"
          confirmLabel="Remover"
          isDestructive
          onConfirm={() => {
            removeRelationship(showRelDeleteConfirm)
            setShowRelDeleteConfirm(null)
          }}
          onCancel={() => setShowRelDeleteConfirm(null)}
        />
      )}

      {showRelNamePrompt && (
        <PromptModal
          title="Editar Nome"
          label="Nome do Relacionamento"
          defaultValue={showRelNamePrompt.label}
          onConfirm={(val) => {
            updateRelationship(showRelNamePrompt.id, { label: val })
            setShowRelNamePrompt(null)
          }}
          onCancel={() => setShowRelNamePrompt(null)}
        />
      )}

      {showRelCardPrompt && (
        <PromptModal
          title="Editar Cardinalidades"
          label="Formato: Origem-Destino (ex: (0,n)-(1,1))"
          defaultValue={`${showRelCardPrompt.sourceCardinality}-${showRelCardPrompt.targetCardinality}`}
          onConfirm={(val) => {
            const [s, t] = val.split('-')
            if (s && t) {
              updateRelationship(showRelCardPrompt.id, {
                sourceCardinality: s.trim(),
                targetCardinality: t.trim()
              })
            }
            setShowRelCardPrompt(null)
          }}
          onCancel={() => setShowRelCardPrompt(null)}
        />
      )}
    </div>
  )
}
