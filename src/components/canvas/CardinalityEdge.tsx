import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow'

export function CardinalityEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  })

  // Atingir o afastamento perfeito para as cardinalidades usando ângulos
  // Quando múltiplas tabelas chegam no mesmo destino, elas têm ângulos de origem diferentes!
  const angle = Math.atan2(sourceY - targetY, sourceX - targetX)
  
  const dist = 42 // Distância do ponto de ancoragem
  
  // Target cardinality: empurramos na direção da origem para que fique na linha
  const tLabelX = targetX + Math.cos(angle) * dist
  const tLabelY = targetY + Math.sin(angle) * dist - 12

  // Source cardinality: empurramos na direção do destino para que saia do handle
  const sLabelX = sourceX - Math.cos(angle) * dist
  const sLabelY = sourceY - Math.sin(angle) * dist - 12

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {/* Label in the middle (Relationship name) */}
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              fontWeight: 700,
              pointerEvents: 'all',
            }}
            className="bg-white dark:bg-dark-panel border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-dark-text px-2 py-0.5 rounded shadow-sm tracking-wide z-10"
          >
            {data.label}
          </div>
        )}

        {/* Start Cardinality (Source) */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${sLabelX}px, ${sLabelY}px)`,
            fontSize: 10,
            fontWeight: 800,
            pointerEvents: 'none',
          }}
          className="text-primary-600 dark:text-primary-400 font-mono tracking-tight bg-white/90 dark:bg-dark-bg/90 px-1 rounded-sm backdrop-blur-sm z-20 border border-transparent dark:border-primary-900/30"
        >
          {data?.sourceCardinality}
        </div>

        {/* End Cardinality (Target) */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${tLabelX}px, ${tLabelY}px)`,
            fontSize: 10,
            fontWeight: 800,
            pointerEvents: 'none',
          }}
          className="text-primary-800 dark:text-primary-300 font-mono tracking-tight bg-white/90 dark:bg-dark-bg/90 px-1 rounded-sm backdrop-blur-sm z-20 border border-transparent dark:border-primary-900/30"
        >
          {data?.targetCardinality}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
