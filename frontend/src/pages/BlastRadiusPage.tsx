import { useNavigate } from 'react-router-dom'
import { Activity, ShieldAlert, Cpu, Server, ArrowRight } from 'lucide-react'
import BlastRadiusGraph from '../components/BlastRadiusGraph'

export default function BlastRadiusPage() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.04))',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 8,
        padding: '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ef4444',
          }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                Infrastructure Blast Radius Map
              </span>
              <span className="badge critical">PROD_DB_CRITICAL</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              Real-Time Cross-Cloud Microservice Dependency & Cascading Failure Topology (INC-2048)
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/incidents/INC-2048')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}
        >
          INVESTIGATE_INCIDENT <ArrowRight size={12} />
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <div className="card" style={{ padding: '10px 14px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            <ShieldAlert size={12} /> ROOT CRITICAL NODE
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>PROD-DB-01</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>PostgreSQL Primary · Connection Pool 100%</div>
        </div>

        <div className="card" style={{ padding: '10px 14px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            <Server size={12} /> DIRECTLY OFFLINE
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>STAGING-API-01</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>HTTP 500 rate: 18.4% · 3/3 pods failing</div>
        </div>

        <div className="card" style={{ padding: '10px 14px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            <Cpu size={12} /> DEGRADED DEPENDENCIES
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>3 Microservices</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>Payment Gateway, Auth, Redis Cache</div>
        </div>

        <div className="card" style={{ padding: '10px 14px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            <Activity size={12} /> PROPAGATION SPEED
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>1.2s to Cascade</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>Topology auto-mapped by Sentinel AI</div>
        </div>
      </div>

      {/* Main Full Graph */}
      <div style={{ flex: 1, minHeight: 460 }}>
        <BlastRadiusGraph />
      </div>
    </div>
  )
}
