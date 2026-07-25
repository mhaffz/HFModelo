import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  ConnectionMode,
  updateEdge,
} from 'reactflow'
import 'reactflow/dist/base.css'

import { useDiagramStore } from '../../store/useDiagramStore'
import { TableNode } from './TableNode'
import { EditTableModal } from '../modals/EditTableModal'
import type { Relationship } from '../../types/diagram'

import { CardinalityEdge } from './CardinalityEdge'
import { DiagramNavigator } from './DiagramNavigator'
import { AiChatWidget } from '../chat/AiChatWidget'
import { convertLogicalToConceptual } from '../../utils/conceptualMode'
import { EntityNode, AttributeNode, RelationshipNode } from './ConceptualNodes'
import { ConfirmModal } from '../modals/ConfirmModal'
import { PromptModal } from '../modals/PromptModal'


// ─── Node/Edge Types Registration ─────────────────────────────────────────────

const NODE_TYPES = {
  tableNode: TableNode,
  entityNode: EntityNode,
  attributeNode: AttributeNode,
  relationshipNode: RelationshipNode
}
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
  const {
    tables,
    relationships,
    updateTablePosition,
    addRelationship,
    removeRelationship,
    updateRelationship,
    appendSchema,
    setError,
    theme,
    diagramType,
    conceptualNodes,
    conceptualEdges,
    updateConceptualNodePosition,
    setConceptualDiagram,
  } = useDiagramStore()

  const [editingTableId, setEditingTableId] = useState<string | null>(null)

  // Modals state
  const [showRelDeleteConfirm, setShowRelDeleteConfirm] = useState<string | null>(null)
  const [showRelNamePrompt, setShowRelNamePrompt] = useState<Relationship | null>(null)
  const [showRelCardPrompt, setShowRelCardPrompt] = useState<Relationship | null>(null)

  // ─── Sync conceitual ─────────────────────────────────────────────────────────
  const buildConceptualDiagram = useCallback(() => {
    const isDark = theme === 'dark'
    const conceptual = convertLogicalToConceptual({ tables, relationships })
    const nodes: Node[] = []
    const edges: Edge[] = []

    // Build entity nodes
    conceptual.entities.forEach(ent => {
      nodes.push({
        id: ent.id,
        type: 'entityNode',
        position: ent.position,
        data: { name: ent.name, isDark },
        draggable: true,
      })
    })

    // Build attribute nodes
    conceptual.attributes.forEach(attr => {
      nodes.push({
        id: attr.id,
        type: 'attributeNode',
        position: attr.position,
        data: { name: attr.name, isPrimaryKey: attr.isPrimaryKey, isDark },
        draggable: true,
      })
    })

    // Build relationship nodes
    conceptual.relationships.forEach(rel => {
      nodes.push({
        id: rel.id,
        type: 'relationshipNode',
        position: rel.position,
        data: { name: rel.name, isDark },
        draggable: true,
      })
    })

    const lineColor = isDark ? '#c8a97a' : '#333333'
    const labelBgFill = isDark ? '#1a1611' : '#f8f8f8'

    // ── Attribute edges: explicit unique routing ──────────
    conceptual.attributes.forEach((attr, index) => {
      const entity = conceptual.entities.find(e => e.id === attr.entityId)
      if (!entity) return

      const dx = attr.position.x - entity.position.x
      const dy = attr.position.y - entity.position.y

      // Select a distributed source handle on the table based on index 
      // This forces the ReactFlow to draw exactly to that point, avoiding central overlap
      const handlePos = 10 + ((index * 20) % 90) // i.e 10, 30, 50, 70, 90...

      let sourceHandle = ''
      let targetHandle = ''

      if (Math.abs(dy) >= Math.abs(dx)) {
        if (dy <= 0) { sourceHandle = `s-top-${handlePos}`; targetHandle = 't-bottom' }
        else { sourceHandle = `s-bottom-${handlePos}`; targetHandle = 't-top' }
      } else {
        if (dx <= 0) { sourceHandle = `s-left-${handlePos}`; targetHandle = 't-right' }
        else { sourceHandle = `s-right-${handlePos}`; targetHandle = 't-left' }
      }

      edges.push({
        id: `e-attr-${attr.id}`,
        source: attr.entityId,
        sourceHandle,
        target: attr.id,
        targetHandle,
        type: 'smoothstep',
        animated: false,
        style: { stroke: lineColor, strokeWidth: 1.5 },
        reconnectable: true,
        interactionWidth: 20, // Torna mais fácil de "agarrar" a linha
      } as Edge)
    })

    // Entidade → Losango → Entidade
    conceptual.relationships.forEach(rel => {
      edges.push({
        id: `e-src-${rel.id}`,
        source: rel.sourceEntityId,
        sourceHandle: 's-bottom',
        target: rel.id,
        targetHandle: 't-top',
        label: rel.sourceCardinality,
        type: 'smoothstep',
        animated: false,
        reconnectable: true,
        style: { stroke: lineColor, strokeWidth: 1.5 },
        labelBgPadding: [4, 3] as [number, number],
        labelBgBorderRadius: 2,
        labelBgStyle: { fill: labelBgFill, fillOpacity: 1 },
        labelStyle: { fill: lineColor, fontWeight: 600, fontSize: 11 },
      } as Edge)
      edges.push({
        id: `e-tgt-${rel.id}`,
        source: rel.id,
        sourceHandle: 's-bottom',
        target: rel.targetEntityId,
        targetHandle: 't-top',
        label: rel.targetCardinality,
        type: 'smoothstep',
        animated: false,
        reconnectable: true,
        style: { stroke: lineColor, strokeWidth: 1.5 },
        labelBgPadding: [4, 3] as [number, number],
        labelBgBorderRadius: 2,
        labelBgStyle: { fill: labelBgFill, fillOpacity: 1 },
        labelStyle: { fill: lineColor, fontWeight: 600, fontSize: 11 },
      } as Edge)
    })

    setConceptualDiagram(nodes, edges)
  }, [tables, relationships, theme, setConceptualDiagram])

  // Map Zustand → React Flow nodes
  const rfNodes = useMemo<Node[]>(() => {
    if (diagramType === 'conceptual') {
      return conceptualNodes
    }

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
  }, [tables, diagramType, conceptualNodes])

  // Lógica de reconexão manual
  const edgeUpdateSuccessful = useRef(true)
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false
  }, [])

  const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
    edgeUpdateSuccessful.current = true
    if (diagramType === 'conceptual') {
      const updatedEdges = updateEdge(oldEdge, newConnection, conceptualEdges)
      setConceptualDiagram(rfNodes, updatedEdges)
    }
  }, [diagramType, conceptualEdges, rfNodes, setConceptualDiagram])

  const onEdgeUpdateEnd = useCallback(() => {
    edgeUpdateSuccessful.current = true
  }, [])

  // Only rebuild if in conceptual and completely empty (e.g. first time with tables)
  useEffect(() => {
    if (diagramType === 'conceptual' && conceptualNodes.length === 0 && tables.length > 0) {
      buildConceptualDiagram()
    }
  }, [conceptualNodes.length, tables.length, diagramType, buildConceptualDiagram])


  // Map Zustand → React Flow edges
  const rfEdges = useMemo<Edge[]>(() => {
    if (diagramType === 'conceptual') {
      return conceptualEdges
    }

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
  }, [relationships, diagramType, tables])

  const [, , onNodesChange] = useNodesState(rfNodes)
  const [, setEdges, onEdgesChange] = useEdgesState(rfEdges)

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes)

      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.dragging) {
          if (diagramType === 'conceptual') {
            updateConceptualNodePosition(change.id, change.position)
          } else {
            updateTablePosition(change.id, change.position)
          }
        }
      })
    },
    [onNodesChange, updateTablePosition, updateConceptualNodePosition, diagramType]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      // No modo conceitual, não permitimos criar "novas" relações lógicas via drag-and-drop
      // Apenas reconexões de edges existentes (onEdgeUpdate)
      if (diagramType === 'conceptual') return

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
    [addRelationship, setEdges, diagramType]
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

  const onContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    // Implement context menu logic here if needed
  }, [])

  return (
    <div className="w-full h-full relative" onDragOver={onDragOver} onDrop={onDrop} onContextMenu={onContextMenu}>
      <DiagramNavigator />

      {/* Botão de Regerar Diagrama no modo Conceitual - Posicionado de forma visível */}
      {diagramType === 'conceptual' && tables.length > 0 && (
        <div className="absolute top-6 right-10 z-[60] pointer-events-auto">
          <button
            onClick={() => buildConceptualDiagram()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-900 border border-primary-800 text-white rounded-xl font-bold text-[13px] hover:bg-primary-800 hover:shadow-2xl hover:shadow-primary-900/40 hover:-translate-y-[2px] active:scale-95 transition-all shadow-xl shadow-primary-900/20"
            title="Recria o diagrama conceitual a partir do modelo lógico atual"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Regerar Diagrama
          </button>
        </div>
      )}

      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
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
          <p className="text-primary-600/60 dark:text-dark-muted text-sm max-w-[280px] font-bold uppercase tracking-widest leading-loose mb-4">
            Comece adicionando uma tabela ou descreva seu modelo na lateral para a IA.
          </p>
          {diagramType === 'conceptual' && (
            <button
              onClick={() => buildConceptualDiagram()}
              className="pointer-events-auto px-6 py-2 bg-primary-900 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-colors shadow-lg shadow-primary-900/20"
            >
              Gerar do Modelo Conceitual
            </button>
          )}
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
