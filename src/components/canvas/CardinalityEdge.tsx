import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from 'reactflow'

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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  })

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
              fontWeight: 600,
              pointerEvents: 'all',
            }}
            className="bg-slate-800/90 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded shadow-sm"
          >
            {data.label}
          </div>
        )}

        {/* Start Cardinality (Source) */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${sourceX + (sourcePosition === 'right' ? 25 : -25)}px, ${sourceY - 15}px)`,
            fontSize: 11,
            fontWeight: 700,
            pointerEvents: 'none',
          }}
          className="text-violet-400 font-mono"
        >
          {data?.sourceCardinality}
        </div>

        {/* End Cardinality (Target) */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${targetX + (targetPosition === 'left' ? -25 : 25)}px, ${targetY - 15}px)`,
            fontSize: 11,
            fontWeight: 700,
            pointerEvents: 'none',
          }}
          className="text-indigo-400 font-mono"
        >
          {data?.targetCardinality}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
