import { useState, useEffect, useRef } from 'react'

interface ServiceNode {
  id: string
  label: string
  sublabel: string
  status: 'critical' | 'offline' | 'warning' | 'healthy'
  x: number
  y: number
  metrics: { key: string; value: string }[]
}

interface Edge {
  from: string
  to: string
  latency: string
  animated: boolean
}

const NODES: ServiceNode[] = [
  {
    id: 'prod-db',
    label: 'PROD-DB-01',
    sublabel: 'PostgreSQL Primary',
    status: 'critical',
    x: 260,
    y: 180,
    metrics: [
      { key: 'Conns', value: '512/512' },
      { key: 'CPU', value: '92%' },
    ],
  },
  {
    id: 'staging-api',
    label: 'STAGING-API-01',
    sublabel: 'Node.js Gateway',
    status: 'offline',
    x: 100,
    y: 80,
    metrics: [
      { key: 'HTTP 500', value: '18.4%' },
      { key: 'Latency', value: '4.8s' },
    ],
  },
  {
    id: 'payment-gw',
    label: 'Payment-Gateway',
    sublabel: 'Stripe Proxy',
    status: 'warning',
    x: 420,
    y: 80,
    metrics: [
      { key: 'TxnFailures', value: '23/min' },
      { key: 'Latency', value: '2.1s' },
    ],
  },
  {
    id: 'user-auth',
    label: 'User-Auth-Service',
    sublabel: 'OAuth2 Provider',
    status: 'warning',
    x: 100,
    y: 290,
    metrics: [
      { key: 'Auth Errors', value: '38%' },
      { key: 'Token TTL', value: 'Degraded' },
    ],
  },
  {
    id: 'cache',
    label: 'Redis-Cache-01',
    sublabel: 'L1 Session Cache',
    status: 'warning',
    x: 420,
    y: 290,
    metrics: [
      { key: 'Evictions', value: '1.2k/s' },
      { key: 'Hit Rate', value: '41%' },
    ],
  },
]

const EDGES: Edge[] = [
  { from: 'prod-db', to: 'staging-api', latency: '4800ms', animated: true },
  { from: 'prod-db', to: 'payment-gw', latency: '2100ms', animated: true },
  { from: 'prod-db', to: 'user-auth', latency: '1940ms', animated: true },
  { from: 'prod-db', to: 'cache', latency: '880ms', animated: true },
]

const STATUS_COLORS = {
  critical: { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', glow: '0 0 12px rgba(239,68,68,0.6)' },
  offline:  { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.08)', text: '#ef4444', glow: '0 0 8px rgba(239,68,68,0.4)' },
  warning:  { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b', glow: '0 0 8px rgba(245,158,11,0.4)' },
  healthy:  { stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.08)', text: '#22c55e', glow: '0 0 8px rgba(34,197,94,0.4)' },
}

const STATUS_BADGE = {
  critical: 'CRITICAL',
  offline: 'OFFLINE',
  warning: 'DEGRADED',
  healthy: 'HEALTHY',
}

function getNodeById(id: string) {
  return NODES.find(n => n.id === id)!
}

export default function BlastRadiusGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [pulsePhase, setPulsePhase] = useState(0)
  const animRef = useRef<any>(null)

  useEffect(() => {
    let frame = 0
    const animate = () => {
      frame++
      setPulsePhase(frame % 120)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div style={{
      background: 'rgba(10, 14, 23, 0.95)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: 6,
      padding: 12,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ef4444', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#ef4444',
              boxShadow: '0 0 6px #ef4444', display: 'inline-block',
              animation: 'pulse-dot 1.2s ease-in-out infinite',
            }} />
            LIVE · BLAST RADIUS ANALYSIS
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: '#fff' }}>
            Infrastructure Impact Graph
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)' }}>AFFECTED_SERVICES</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 800, color: '#ef4444' }}>4 / 5</div>
        </div>
      </div>

      {/* Legend chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {(['critical', 'offline', 'warning'] as const).map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[s].stroke }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {STATUS_BADGE[s]}
            </span>
          </div>
        ))}
      </div>

      {/* SVG Graph */}
      <svg viewBox="0 0 540 380" style={{ width: '100%', height: 260, display: 'block' }}>
        <defs>
          {NODES.map(n => (
            <filter key={`glow-${n.id}`} id={`glow-${n.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={n.status === 'critical' ? '4' : '2.5'} result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
          {/* Animated gradient for edge pulses */}
          <linearGradient id="pulse-grad-red" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pulse-grad-amber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Edges */}
        {EDGES.map((edge, i) => {
          const fromNode = getNodeById(edge.from)
          const toNode = getNodeById(edge.to)
          // Offset pulse per edge so they stagger
          const progress = ((pulsePhase + i * 30) % 120) / 120

          return (
            <g key={`${edge.from}-${edge.to}`}>
              {/* Base line */}
              <line
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke="rgba(239, 68, 68, 0.18)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              {/* Animated pulse dot */}
              <circle
                cx={fromNode.x + (toNode.x - fromNode.x) * progress}
                cy={fromNode.y + (toNode.y - fromNode.y) * progress}
                r={3.5}
                fill="#ef4444"
                opacity={0.9 - Math.abs(progress - 0.5) * 1.2}
                filter="url(#glow-prod-db)"
              />
              {/* Latency label midpoint */}
              <text
                x={(fromNode.x + toNode.x) / 2 + 4}
                y={(fromNode.y + toNode.y) / 2 - 5}
                fill="rgba(239,68,68,0.7)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                {edge.latency}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {NODES.map(node => {
          const c = STATUS_COLORS[node.status]
          const isHovered = hoveredNode === node.id
          const isCritical = node.status === 'critical'
          const pulseR = 26 + (isCritical ? (pulsePhase % 30) * 0.3 : 0)

          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Outer pulse ring for critical */}
              {isCritical && (
                <circle
                  r={pulseR}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={1}
                  opacity={1 - (pulsePhase % 30) / 30}
                />
              )}
              {/* Node background */}
              <rect
                x={-50} y={-22}
                width={100} height={44}
                rx={5}
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={isHovered ? 1.5 : 1}
                filter={`url(#glow-${node.id})`}
              />
              {/* Status indicator dot */}
              <circle cx={-38} cy={0} r={4} fill={c.stroke} />
              {/* Label */}
              <text
                textAnchor="middle" dominantBaseline="middle"
                y={-7}
                fontSize={8.5}
                fontWeight="700"
                fill="#fff"
                fontFamily="var(--font-mono)"
              >
                {node.label}
              </text>
              <text
                textAnchor="middle" dominantBaseline="middle"
                y={5}
                fontSize={7}
                fill="rgba(255,255,255,0.5)"
                fontFamily="var(--font-mono)"
              >
                {node.sublabel}
              </text>
              {/* Status badge */}
              <text
                textAnchor="middle" dominantBaseline="middle"
                y={17}
                fontSize={7}
                fontWeight="600"
                fill={c.text}
                fontFamily="var(--font-mono)"
              >
                {STATUS_BADGE[node.status]}
              </text>

              {/* Hover metric tooltip */}
              {isHovered && (
                <g transform="translate(0, -64)">
                  <rect x={-62} y={0} width={124} height={node.metrics.length * 14 + 8} rx={4}
                    fill="rgba(10, 14, 23, 0.96)" stroke={c.stroke} strokeWidth={1} />
                  {node.metrics.map((m, i) => (
                    <text key={i} textAnchor="middle" y={14 + i * 14}
                      fontSize={8} fill="rgba(255,255,255,0.85)" fontFamily="var(--font-mono)">
                      <tspan fill={c.text}>{m.key}:</tspan> {m.value}
                    </text>
                  ))}
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Bottom status strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 8,
        borderTop: '1px solid rgba(239, 68, 68, 0.15)', paddingTop: 8,
      }}>
        {NODES.filter(n => n.id !== 'prod-db').map(node => {
          const c = STATUS_COLORS[node.status]
          return (
            <div key={node.id} style={{
              background: c.fill, border: `1px solid ${c.stroke}`,
              borderRadius: 4, padding: '4px 6px',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: c.text, fontWeight: 700 }}>
                {STATUS_BADGE[node.status]}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                {node.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'var(--text-secondary)', marginTop: 1 }}>
                {node.metrics[0].key}: <span style={{ color: c.text }}>{node.metrics[0].value}</span>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
      `}</style>
    </div>
  )
}
