import { Handle, Position } from 'reactflow'

// ─── EntityNode ──────────────────────────────────────────────────────────────
export function EntityNode({ data }: { data: { name: string; isDark?: boolean } }) {
  const isDark = data.isDark ?? false
  
  // Cria dezenas de handles espaçados para que linhas fiquem separadas (snap)
  const createHandles = (position: Position, idPrefix: string) => {
    const handles = []
    for (let i = 10; i <= 90; i += 10) {
      const style: any = { opacity: 0, width: 6, height: 6, pointerEvents: 'all' }
      if (position === Position.Top || position === Position.Bottom) style.left = `${i}%`
      if (position === Position.Left || position === Position.Right) style.top = `${i}%`
      
      handles.push(
        <Handle key={`s-${idPrefix}-${i}`} type="source" id={`s-${idPrefix}-${i}`} position={position} style={style} />
      )
      handles.push(
        <Handle key={`t-${idPrefix}-${i}`} type="target" id={`t-${idPrefix}-${i}`} position={position} style={style} />
      )
    }
    return handles
  }

  return (
    <div style={{
      background: isDark ? '#1e1b16' : '#ffffff',
      border: `2px solid ${isDark ? '#c8a97a' : '#111111'}`,
      minWidth: 120,
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 0,
      position: 'relative',
    }}>
      {createHandles(Position.Top, 'top')}
      {createHandles(Position.Bottom, 'bottom')}
      {createHandles(Position.Left, 'left')}
      {createHandles(Position.Right, 'right')}

      <Handle type="source" id="s-bottom" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" id="t-top" position={Position.Top} style={{ opacity: 0 }} />

      <span style={{
        fontWeight: 700,
        fontSize: 13,
        color: isDark ? '#c8a97a' : '#111111',
        letterSpacing: 0.5,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}>
        {data.name}
      </span>
    </div>
  )
}

// ─── AttributeNode ───────────────────────────────────────────────────────────
export function AttributeNode({ data }: { data: { name: string; isPrimaryKey?: boolean; isDark?: boolean } }) {
  const isPK = !!data.isPrimaryKey
  const isDark = data.isDark ?? false
  const borderColor = isDark ? '#c8a97a' : '#111111'
  const textColor = isDark ? '#c8a97a' : '#111111'
  const dotBg = isPK ? borderColor : (isDark ? '#1e1b16' : '#ffffff')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative', cursor: 'grab', padding: '4px' }}>
      {/* 
        Container estritamente do tamanho da bolinha.
        Handles ficam exatamente no centro.
      */}
      <div style={{ position: 'relative', width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
        {/* Handles centralizados: o ID e Position guiam a curva certa (sem looping), e o local (50%) garante que pare no centro visível */}
        <Handle type="target" id="t-top"    position={Position.Top}    style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 4, pointerEvents: 'all' }} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 4, pointerEvents: 'all' }} />
        <Handle type="target" id="t-left"   position={Position.Left}   style={{ opacity: 0, top: '50%', left: 0, transform: 'translate(-50%, -50%)', width: 4, height: 4, pointerEvents: 'all' }} />
        <Handle type="target" id="t-right"  position={Position.Right}  style={{ opacity: 0, top: '50%', right: 0, transform: 'translate(-50%, -50%)', width: 4, height: 4, pointerEvents: 'all' }} />

        <Handle type="source" id="s-bottom" position={Position.Bottom} style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 4, pointerEvents: 'all' }} />
        <Handle type="source" id="s-top"    position={Position.Top}    style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 4, pointerEvents: 'all' }} />

        {/* Círculo visual perfeitamente redondo */}
        <div style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          border: `2px solid ${borderColor}`,
          background: dotBg,
          boxSizing: 'border-box'
        }} />
      </div>

      <span style={{
        fontSize: 12,
        fontWeight: isPK ? 700 : 400,
        color: textColor,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        lineHeight: 1,
      }}>
        {data.name}
      </span>
    </div>
  )
}

// ─── RelationshipNode ─────────────────────────────────────────────────────────
export function RelationshipNode({ data }: { data: { name: string; isDark?: boolean } }) {
  const isDark = data.isDark ?? false
  const fillColor = isDark ? '#1e1b16' : '#ffffff'
  const strokeColor = isDark ? '#c8a97a' : '#111111'
  const textColor = isDark ? '#c8a97a' : '#111111'
  const W = 120
  const H = 64
  const label: string = data.name || ''
  const displayLabel = label.length > 13 ? label.slice(0, 12) + '…' : label

  return (
    <div style={{ width: W, height: H, position: 'relative' }}>
      <Handle type="target" id="t-left"   position={Position.Left}   style={{ opacity: 0, left: 0,   top: '50%',  width: 10, height: 10, pointerEvents: 'all' }} />
      <Handle type="target" id="t-right"  position={Position.Right}  style={{ opacity: 0, right: 0,  top: '50%',  width: 10, height: 10, pointerEvents: 'all' }} />
      <Handle type="target" id="t-top"    position={Position.Top}    style={{ opacity: 0, top: 0,    left: '50%', width: 10, height: 10, pointerEvents: 'all' }} />
      <Handle type="target" id="t-bottom" position={Position.Bottom} style={{ opacity: 0, bottom: 0, left: '50%', width: 10, height: 10, pointerEvents: 'all' }} />
      <Handle type="source" id="s-left"   position={Position.Left}   style={{ opacity: 0, left: 0,   top: '50%',  width: 10, height: 10, pointerEvents: 'all' }} />
      <Handle type="source" id="s-right"  position={Position.Right}  style={{ opacity: 0, right: 0,  top: '50%',  width: 10, height: 10, pointerEvents: 'all' }} />
      <Handle type="source" id="s-top"    position={Position.Top}    style={{ opacity: 0, top: 0,    left: '50%', width: 10, height: 10, pointerEvents: 'all' }} />
      <Handle type="source" id="s-bottom" position={Position.Bottom} style={{ opacity: 0, bottom: 0, left: '50%', width: 10, height: 10, pointerEvents: 'all' }} />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', display: 'block' }}
      >
        <polygon
          points={`${W / 2},2 ${W - 3},${H / 2} ${W / 2},${H - 2} 3,${H / 2}`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
        />
        <text
          x={W / 2}
          y={H / 2 + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill={textColor}
          style={{ userSelect: 'none' }}
        >
          {displayLabel}
        </text>
      </svg>
    </div>
  )
}
