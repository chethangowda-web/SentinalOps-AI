import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Filter } from 'lucide-react'
import { api } from '../utils/api'

interface Incident {
  id: string;
  incidentId: string;
  title: string;
  service: string;
  environment: string;
  severity: string;
  status: string;
  confidence: number | null;
  assignedTo: string;
  createdAt: string;
}

export default function IncidentList() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadIncidents() {
      try {
        const data = await api.getIncidents();
        setIncidents(data);
      } catch (error) {
        console.error('Failed to load incidents:', error);
      } finally {
        setLoading(false);
      }
    }
    loadIncidents();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const filteredIncidents = incidents.filter(inc => 
    inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.incidentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>All Incidents</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {filteredIncidents.length} total incidents tracked by SentinelOps AI
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8,
                padding: '8px 12px 8px 34px', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)',
                outline: 'none', width: 240,
              }}
            />
          </div>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px 14px' }}>
            <Filter size={14} /> Filter
          </button>
          <button className="btn btn-primary" style={{ fontSize: 12, padding: '8px 14px' }}>
            <Plus size={14} /> New Incident
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40 }}>
            <div className="skeleton" style={{ height: 40, width: '100%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 40, width: '100%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 40, width: '100%' }} />
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No incidents found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Title</th>
                <th>Service</th>
                <th>Environment</th>
                <th>Severity</th>
                <th>Status</th>
                <th>AI Confidence</th>
                <th>Assigned To</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((inc, i) => (
                <tr
                  key={inc.id}
                  className={`animate-in delay-${i + 1}`}
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                >
                  <td><span className="incident-id">{inc.incidentId}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inc.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{inc.service}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{inc.environment}</span>
                  </td>
                  <td><span className={`badge ${inc.severity.toLowerCase()}`}>{inc.severity}</span></td>
                  <td>
                    <span className={`badge ${
                      inc.status === 'INVESTIGATING' ? 'investigating' :
                      inc.status === 'RESOLVED' ? 'resolved' :
                      inc.status === 'NEW' ? 'new' :
                      inc.status === 'REMEDIATION_PENDING' ? 'pending' :
                      'pending'
                    }`}>
                      {inc.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    {inc.confidence ? (
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                        color: inc.confidence > 90 ? 'var(--sentinel-green)' : inc.confidence > 70 ? 'var(--sentinel-amber)' : 'var(--text-muted)',
                      }}>
                        {inc.confidence}%
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{inc.assignedTo}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{formatDate(inc.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
