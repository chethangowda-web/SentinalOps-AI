import { useEffect, useState } from 'react'
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Server,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { mockServers, dashboardStats } from '../data/mockData'
import AgentDag from '../components/AgentDag'

interface IncidentData {
  id: string;
  incidentId: string;
  title: string;
  severity: string;
  status: string;
}

interface AuditLogData {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<IncidentData[]>([])
  const [approvalsCount, setApprovalsCount] = useState(0)
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const incs = await api.getIncidents();
        setIncidents(incs);
        
        const apprs = await api.getApprovals();
        const pending = apprs.filter((a: any) => a.status === 'PENDING').length;
        setApprovalsCount(pending);

        const logs = await api.getAuditLogs('INC-2048').catch(() => []);
        setAuditLogs(logs);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  return (
    <div style={{ maxWidth: 1400, display: 'flex', flexDirection: 'column', gap: 12 }}>
      
      {/* System Health Hero */}
      <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(6, 182, 212, 0.05))', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="section-title" style={{ color: 'var(--sentinel-cyan)', fontSize: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={12} /> System Health Observability
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', letterSpacing: '-0.5px' }}>
                {dashboardStats.systemHealth}%
              </span>
              <span className="badge resolved" style={{ fontSize: 9, padding: '2px 6px' }}>HEALTHY_BASELINE</span>
            </div>
            <div className="health-bar-bg" style={{ width: 320, marginTop: 10, height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div className="health-bar-fill green" style={{ width: `${dashboardStats.systemHealth}%`, height: '100%', background: 'linear-gradient(90deg, var(--sentinel-blue), var(--sentinel-green))', boxShadow: '0 0 10px var(--sentinel-green)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            <div style={{ textAlign: 'right' }}>
              <div className="section-title" style={{ fontSize: 9 }}>AVG_RESPONSE</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff', marginTop: 2 }}>
                {dashboardStats.avgResponseTime}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="section-title" style={{ fontSize: 9 }}>MTTR</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--sentinel-green)', marginTop: 2 }}>
                {dashboardStats.mttr}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row (SRE Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        <div className="metric-card">
          <div className="metric-label">Active Incidents</div>
          <div className="metric-value" style={{ color: activeIncidents.length > 0 ? 'var(--color-warn-text)' : '#fff' }}>
            {activeIncidents.length}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Critical Alerts</div>
          <div className="metric-value" style={{ color: criticalCount > 0 ? 'var(--color-error-text)' : '#fff' }}>
            {criticalCount}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending Approvals</div>
          <div className="metric-value" style={{ color: approvalsCount > 0 ? 'var(--color-warn-text)' : '#fff' }}>
            {approvalsCount}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Resolved Today</div>
          <div className="metric-value" style={{ color: 'var(--color-success-text)' }}>
            {resolvedCount + dashboardStats.resolvedToday}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">AI Remediation Runs</div>
          <div className="metric-value" style={{ color: 'var(--color-info-text)' }}>
            {dashboardStats.aiResolutionsToday}
          </div>
        </div>
      </div>

      {/* Split details layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        
        {/* Active Monitor lists */}
        <div className="card" style={{ maxHeight: 380, overflowY: 'auto' }}>
          <div className="section-header">
            <div>
              <div className="section-title">Active Monitors</div>
              <div className="section-subtitle">Systems currently under observation</div>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: 10, padding: '4px 8px' }} onClick={() => navigate('/incidents')}>
              VIEW_ALL <ArrowUpRight size={10} />
            </button>
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: 100, width: '100%' }} />
          ) : activeIncidents.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: 12, fontSize: 12 }}>No active alerts</div>
          ) : (
            activeIncidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => navigate(`/incidents/${inc.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 8px', borderBottom: '1px solid var(--border-sre)', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 12
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="incident-id">{inc.incidentId}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 12.5 }}>{inc.title}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`badge ${inc.severity.toLowerCase()}`}>{inc.severity}</span>
                  <span className={`badge ${inc.status === 'INVESTIGATING' ? 'investigating' : 'pending'}`}>
                    {inc.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Agent Orchestrator DAG Visualizer */}
        <div className="card" style={{ maxHeight: 380, display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: 8 }}>
            <div>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={12} style={{ color: 'var(--color-info-text)' }} />
                AI Agent Trace (Anthropic MCP DAG)
              </div>
              <div className="section-subtitle">Visualized real-time multi-agent execution status for INC-2048</div>
            </div>
            <div className="status-dot" style={{ background: 'var(--sentinel-cyan)' }} />
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            {loading ? (
              <div className="skeleton" style={{ height: 260, width: '100%' }} />
            ) : (
              <AgentDag status={incidents.find(i => i.incidentId === 'INC-2048')?.status || 'NEW'} autoAnimate={true} />
            )}
          </div>
        </div>
      </div>

      {/* Infrastructure Status */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: 10 }}>
          <div className="section-title">Telemetry Host Node Matrix</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {mockServers.map(server => (
            <div key={server.name} className="metric-card" style={{ padding: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', fontWeight: 600 }}>{server.name}</span>
                <span className={`badge ${server.status === 'healthy' ? 'resolved' : 'high'}`} style={{ fontSize: 8, padding: '1px 4px' }}>
                  {server.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                <span>CPU: {server.cpu}%</span>
                <span>MEM: {server.memory}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
