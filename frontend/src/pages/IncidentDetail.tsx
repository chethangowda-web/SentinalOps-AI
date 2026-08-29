import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Clock,
  FileText, BarChart3, Terminal, Brain
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../utils/api'
import AgentDag from '../components/AgentDag'

interface IncidentDetailData {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  service: string;
  environment: string;
  severity: string;
  status: string;
  confidence: number | null;
  rootCause: string | null;
  assignedTo: string;
  createdAt: string;
  tags: string[];
}

interface LogData {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

interface MetricData {
  id: string;
  metricName: string;
  value: number;
  unit: string;
  status: string;
}

interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  relevance: number;
}

interface TimelineEvent {
  id: string;
  time: string;
  event: string;
  type: 'info' | 'completed' | 'warning' | 'error' | 'active';
}

const cpuData = [
  { time: '13:50', value: 45 }, { time: '13:52', value: 48 }, { time: '13:54', value: 52 },
  { time: '13:56', value: 58 }, { time: '13:58', value: 65 }, { time: '14:00', value: 72 },
  { time: '14:02', value: 88 }, { time: '14:04', value: 92 }, { time: '14:06', value: 91 },
]
const errData = [
  { time: '13:50', value: 0.2 }, { time: '13:52', value: 0.3 }, { time: '13:54', value: 0.5 },
  { time: '13:56', value: 1.2 }, { time: '13:58', value: 3.8 }, { time: '14:00', value: 8.1 },
  { time: '14:02', value: 14.5 }, { time: '14:04', value: 18.4 }, { time: '14:06', value: 17.2 },
]

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('summary')
  const [incident, setIncident] = useState<IncidentDetailData | null>(null)
  const [logs, setLogs] = useState<LogData[]>([])
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([])
  const [approvalId, setApprovalId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadDetails() {
    if (!id) return;
    try {
      const incData = await api.getIncident(id);
      setIncident(incData);

      const logsData = await api.getLogs(incData.id).catch(() => []);
      setLogs(logsData);

      const metricsData = await api.getMetrics(incData.id).catch(() => []);
      setMetrics(metricsData);

      const auditData = await api.getAuditLogs(incData.incidentId).catch(() => []);
      
      const mappedTimeline: TimelineEvent[] = auditData.map((log: any) => {
        const date = new Date(log.timestamp);
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        let type: 'info' | 'completed' | 'warning' | 'error' | 'active' = 'info';
        if (log.action === 'ESCALATION') type = 'warning';
        if (log.action === 'DIAGNOSIS') type = 'completed';
        if (log.action === 'HUMAN_APPROVAL') type = 'completed';
        if (log.action === 'CLASSIFICATION') type = 'warning';
        if (log.action === 'LANGUAGE_DETECTION') type = 'info';
        
        return {
          id: log.id,
          time: timeStr,
          event: log.detail,
          type
        };
      });
      setTimeline(mappedTimeline);

      const docs = await api.searchKnowledge(incData.rootCause || incData.title).catch(() => []);
      setKnowledgeDocs(docs);

      const apprs = await api.getApprovals();
      const currentApproval = apprs.find((a: any) => a.incidentId === incData.id && a.status === 'PENDING');
      if (currentApproval) {
        setApprovalId(currentApproval.id);
      } else {
        setApprovalId(null);
      }
    } catch (error) {
      console.error('Failed to load incident detail:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
    const interval = setInterval(loadDetails, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!approvalId) return;
    try {
      await api.postApprovalDecision(approvalId, decision);
      loadDetails();
    } catch (e) {
      alert('Error updating approval status: ' + e);
    }
  };

  if (loading && !incident) {
    return (
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 80, width: '100%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 200, width: '100%' }} />
      </div>
    )
  }

  if (!incident) {
    return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>Incident not found</div>
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: <FileText size={12} /> },
    { id: 'metrics', label: 'Metrics', icon: <BarChart3 size={12} /> },
    { id: 'logs', label: 'Logs', icon: <Terminal size={12} /> },
    { id: 'investigation', label: 'AI Investigation', icon: <Brain size={12} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={12} /> },
  ]

  const relevantDocs = knowledgeDocs.filter(d => d.relevance > 80).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* Breadcrumb row / header actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/incidents')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                   display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <ArrowLeft size={12} /> BACK_TO_MONITORS
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/reports/${incident.incidentId}`)}>
            <FileText size={12} /> REPORT
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/chat')}>
            <Brain size={12} /> CHAT_CONSOLE
          </button>
        </div>
      </div>

      {/* SRE Split-Pane Workspace */}
      <div className="sre-split-pane">
        
        {/* Left Side: Dense Metadata panel */}
        <div className="sre-sidebar">
          <div>
            <div className="section-title" style={{ marginBottom: 8 }}>Incident Information</div>
            <div className="metadata-grid">
              <div className="metadata-row">
                <span className="metadata-label">ID</span>
                <span className="metadata-value">{incident.incidentId}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">Severity</span>
                <span className={`badge ${incident.severity.toLowerCase()}`}>{incident.severity}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">Status</span>
                <span className={`badge ${
                  incident.status === 'INVESTIGATING' ? 'investigating' : 
                  incident.status === 'RESOLVED' ? 'resolved' : 
                  incident.status === 'NEW' ? 'new' : 
                  incident.status === 'REMEDIATION_PENDING' ? 'pending' : 
                  'pending'
                }`}>
                  {incident.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">Service</span>
                <span className="metadata-value">{incident.service}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">Environment</span>
                <span className="metadata-value" style={{ textTransform: 'uppercase' }}>{incident.environment}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">Assignee</span>
                <span className="metadata-value">{incident.assignedTo}</span>
              </div>
              {incident.confidence && (
                <div className="metadata-row">
                  <span className="metadata-label">AI Confidence</span>
                  <span className="metadata-value" style={{ color: 'var(--color-success-text)' }}>{incident.confidence}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Root Cause block */}
          {incident.rootCause && (
            <div style={{ borderTop: '1px solid var(--border-sre)', paddingTop: 10 }}>
              <div className="section-title" style={{ marginBottom: 6 }}>DIAGNOSED_ROOT_CAUSE</div>
              <div style={{ fontStyle: 'normal', fontWeight: 500, color: '#fff', fontSize: 12 }}>
                {incident.rootCause}
              </div>
            </div>
          )}

          {/* Safety approvals nested inside Left context sidebar */}
          <div style={{ borderTop: '1px solid var(--border-sre)', paddingTop: 10, marginTop: 'auto' }}>
            {approvalId ? (
              <div>
                <div className="section-title" style={{ color: 'var(--color-error-text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={12} /> ACTION_REQUIRED
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
                  Recommended Action: <strong style={{ color: 'var(--text-primary)' }}>Restart API instances</strong>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-approve" style={{ flex: 1, fontSize: 11, padding: '4px 8px' }} onClick={() => handleDecision('APPROVED')}>
                    APPROVE
                  </button>
                  <button className="btn btn-reject" style={{ flex: 1, fontSize: 11, padding: '4px 8px' }} onClick={() => handleDecision('REJECTED')}>
                    REJECT
                  </button>
                </div>
              </div>
            ) : incident.status === 'APPROVED' ? (
              <div style={{ color: 'var(--color-success-text)', fontSize: 11.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} /> Action Authorized. Deploying...
              </div>
            ) : incident.status === 'RESOLVED' ? (
              <div style={{ color: 'var(--color-success-text)', fontSize: 11.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} /> Remediation Executed.
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontStyle: 'italic' }}>
                No actions pending approval.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tab panel workspace */}
        <div className="sre-main-pane">
          {/* Flat SRE Tab switcher */}
          <div className="language-selector" style={{ alignSelf: 'flex-start' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`lang-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px' }}
              >
                {tab.icon} {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Active Tab Panel Content */}
          <div style={{ flex: 1 }}>
            {activeTab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                {/* Datadog style metrics summary */}
                <div className="metrics-grid">
                  {metrics.slice(0, 4).map(m => (
                    <div key={m.id} className="metric-card">
                      <div className="metric-label">{m.metricName}</div>
                      <div className={`metric-value ${m.status}`}>
                        {m.value}{m.unit}
                      </div>
                      <div className="health-bar-bg">
                        <div className={`health-bar-fill ${m.status === 'danger' ? 'red' : m.status === 'warning' ? 'amber' : 'green'}`}
                          style={{ width: `${Math.min(m.value, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Evidence Checklist */}
                  <div className="card" style={{ marginBottom: 0 }}>
                    <div className="section-header">
                      <div className="section-title">Supporting Telemetry Evidence</div>
                    </div>
                    {(incident.title.includes('Kubernetes') || incident.title.includes('CrashLoopBackOff') || incident.title.includes('Payment')
                      ? [
                          'OOMKilled events detected in payment-service pod logs',
                          'Memory usage exceeded configured limit (512Mi)',
                          'Memory saturation trend starting after deployment v2.4.1',
                          'Container restarted 7 times in past 15 minutes',
                        ]
                      : incident.title.includes('Redis')
                      ? [
                          'Redis memory usage at 94% threshold limit',
                          'Latency spikes exceeding 200ms on key cache hits',
                          'CPU core utilization spiked during command processing',
                          'Memory fragmentation ratio increased above baseline',
                        ]
                      : [
                          'Database connection saturation at 98% on PROD-DB-01',
                          'Connection timeout errors in application logs',
                          'HTTP 500 error rate correlation (18.4%)',
                          'Historical incident INC-1842 pattern match',
                          'CPU usage at 92%, Memory usage at 89%',
                        ]
                    ).map((e, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: 'var(--text-primary)' }}>
                        <CheckCircle2 size={13} style={{ color: 'var(--color-success-text)', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{e}</span>
                      </div>
                    ))}
                  </div>

                  {/* RAG Knowledge retrieval matching */}
                  <div className="card" style={{ marginBottom: 0 }}>
                    <div className="section-header">
                      <div className="section-title">Retrieved SOP Runbooks (RAG Match)</div>
                    </div>
                    {relevantDocs.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>No matching SOP documents found</div>
                    ) : (
                      relevantDocs.map(doc => (
                        <div key={doc.id} className="kb-document">
                          <FileText size={14} className="kb-icon" />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{doc.title}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{doc.category}</div>
                          </div>
                          <span className={`kb-relevance ${doc.relevance > 88 ? 'high' : 'medium'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                            {doc.relevance}%
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'metrics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="metrics-grid">
                  {metrics.map(m => (
                    <div key={m.id} className="metric-card">
                      <div className="metric-label">{m.metricName}</div>
                      <div className={`metric-value ${m.status}`}>
                        {m.value}{m.unit}
                      </div>
                      <div className="health-bar-bg">
                        <div className={`health-bar-fill ${m.status === 'danger' ? 'red' : m.status === 'warning' ? 'amber' : 'green'}`}
                          style={{ width: `${Math.min(m.value, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="card" style={{ marginBottom: 0 }}>
                    <div className="section-title" style={{ marginBottom: 12 }}>CPU METRICS OVERTIME</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={cpuData}>
                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-sre)', fontSize: 11 }} />
                        <Area type="monotone" dataKey="value" stroke="var(--color-error-text)" fill="rgba(239, 68, 68, 0.05)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card" style={{ marginBottom: 0 }}>
                    <div className="section-title" style={{ marginBottom: 12 }}>HTTP 500 ERROR RATE %</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={errData}>
                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-sre)', fontSize: 11 }} />
                        <Area type="monotone" dataKey="value" stroke="var(--color-warn-text)" fill="rgba(245, 158, 11, 0.05)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="log-terminal" style={{ maxHeight: 480 }}>
                {logs.map(log => (
                  <div key={log.id} className="log-line">
                    <span className="log-timestamp">[{log.timestamp}]</span>
                    <span className={`log-level ${log.level.toLowerCase()}`}>{log.level} |</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'investigation' && (
              <div className="card" style={{ margin: 0, minHeight: 460 }}>
                <AgentDag status={incident.status} autoAnimate={false} />
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="card" style={{ margin: 0 }}>
                <div className="section-title" style={{ marginBottom: 16 }}>SRE Operational Timeline</div>
                <div className="timeline">
                  {timeline.map(event => (
                    <div key={event.id} className="timeline-item">
                      <div className={`timeline-dot ${event.type}`} />
                      <span className="timeline-time">{event.time}</span>
                      <span className="timeline-text" style={{ fontSize: 12.5 }}>{event.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
