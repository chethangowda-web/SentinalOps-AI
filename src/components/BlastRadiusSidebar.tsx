import BlastRadiusGraph from './BlastRadiusGraph'

export default function BlastRadiusSidebar() {
  return (
    <aside style={{
      background: 'rgba(24,28,40,0.95)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 6,
      padding: '12px',
      fontFamily: 'var(--font-mono)',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 120px)',
    }}>
      <h2 style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#fff',
        marginBottom: 8,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 4,
      }}>
        Blast Radius Analysis
      </h2>
      <BlastRadiusGraph />
    </aside>
  )
}
