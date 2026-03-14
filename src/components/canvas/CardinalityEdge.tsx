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
              fontWeight: 700,
              pointerEvents: 'all',
            }}
            className="bg-white border border-primary-200 text-primary-700 px-2 py-0.5 rounded shadow-sm tracking-wide"
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
            fontWeight: 800,
            pointerEvents: 'none',
          }}
          className="text-primary-600 font-mono tracking-tight bg-white/80 px-1 rounded-sm backdrop-blur-sm"
        >
          {data?.sourceCardinality}
        </div>

        {/* End Cardinality (Target) */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${targetX + (targetPosition === 'left' ? -25 : 25)}px, ${targetY - 15}px)`,
            fontSize: 11,
            fontWeight: 800,
            pointerEvents: 'none',
          }}
          className="text-primary-800 font-mono tracking-tight bg-white/80 px-1 rounded-sm backdrop-blur-sm"
        >
          {data?.targetCardinality}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
