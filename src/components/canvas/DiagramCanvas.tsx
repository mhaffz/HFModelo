import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/base.css'

import { useDiagramStore } from '../../store/useDiagramStore'
import { TableNode, type TableNodeData } from './TableNode'
import { EditTableModal } from '../modals/EditTableModal'
import type { Relationship } from '../../types/diagram'

import { CardinalityEdge } from './CardinalityEdge'

// ─── Node/Edge Types Registration ─────────────────────────────────────────────

const NODE_TYPES = { tableNode: TableNode }
const EDGE_TYPES = { cardinalityEdge: CardinalityEdge }

// ─── Relationship Type → Edge Style ──────────────────────────────────────────

function relationshipToEdgeStyle(rel: Relationship): Partial<Edge> {
  const baseStyle = {
    stroke: '#818cf8',
    strokeWidth: 2,
  }

  // If it's a many-to-many relationship (implied by 'n' in both ends)
  const isNM = rel.sourceCardinality?.includes('n') && rel.targetCardinality?.includes('n')

  if (isNM) {
    return {
      style: { ...baseStyle, stroke: '#c084fc' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#c084fc' },
      markerStart: { type: MarkerType.ArrowClosed, color: '#c084fc' },
    }
  }

  return {
    style: baseStyle,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' },
  }
}

// ─── DiagramCanvas ────────────────────────────────────────────────────────────

export function DiagramCanvas() {
  const { tables, relationships, updateTablePosition, addRelationship, removeRelationship, updateRelationship } =
    useDiagramStore()
  const [editingTableId, setEditingTableId] = useState<string | null>(null)

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
        const newLabel = prompt('Novo nome do relacionamento:', rel.label)
        if (newLabel !== null) updateRelationship(rel.id, { label: newLabel })
      } else if (action === '2') {
        const sCard = prompt('Cardinalidade Origem (ex: (0,n)):', rel.sourceCardinality)
        const tCard = prompt('Cardinalidade Destino (ex: (1,1)):', rel.targetCardinality)
        if (sCard !== null && tCard !== null) {
          updateRelationship(rel.id, { sourceCardinality: sCard, targetCardinality: tCard })
        }
      } else if (action === '3') {
        if (confirm(`Remover relacionamento?`)) {
          removeRelationship(edge.id)
        }
      }
    },
    [relationships, updateRelationship, removeRelationship]
  )

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        snapToGrid
        snapGrid={[24, 24]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={null}
        className="bg-slate-950"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e293b"
        />
        <Controls
          className="!bg-slate-800 !border-slate-700 !shadow-xl"
          showInteractive={false}
        />
        <MiniMap
          nodeColor="#4338ca"
          maskColor="rgba(15, 23, 42, 0.7)"
          className="!bg-slate-900 !border-slate-700 !rounded-xl !shadow-xl"
        />
      </ReactFlow>

      {/* Empty state */}
      {tables.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="text-center space-y-3 opacity-40">
            <div className="text-7xl">🗄️</div>
            <p className="text-slate-300 text-lg font-semibold">Canvas vazio</p>
            <p className="text-slate-500 text-sm">
              Descreva seu banco de dados no painel esquerdo
              <br />
              ou clique em "Adicionar Tabela"
            </p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTableId && (
        <EditTableModal
          tableId={editingTableId}
          onClose={() => setEditingTableId(null)}
        />
      )}
    </div>
  )
}
