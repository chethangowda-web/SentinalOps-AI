import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
  ExternalLink, Brain
} from 'lucide-react'
import { api } from '../utils/api'
import AudioBriefing from '../components/AudioBriefing'
import TerminalSandbox from '../components/TerminalSandbox'
import CompliancePostMortem from '../components/CompliancePostMortem'

interface Incident {
  id: string;
  incidentId: string;
  title: string;
  service?: string;
  environment?: string;
  severity: string;
  status?: string;
  rootCause?: string;
}

interface Approval {
  id: string;
  incidentId: string;
  incident: Incident;
  riskLevel: string;
  status: string;
  recommendedAction: string;
  reasoning: string;
  aiConfidence: number;
  assignedTo: string;
  createdAt: string;
  evidence: string[];
  affectedServices: string[];
}

export default function ApprovalCenter() {
  const navigate = useNavigate()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showPostMortem, setShowPostMortem] = useState(false)
  const [approvedIncident, setApprovedIncident] = useState<any>(null)

  async function loadApprovals() {
    try {
      const data = await api.getApprovals();
      setApprovals(data);
    } catch (e) {
      console.error('Failed to load approvals:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleDecision = async (approvalId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      const appr = approvals.find(a => a.id === approvalId);
      if (decision === 'APPROVED') {
        setProcessingId(approvalId);
        if (appr) {
          setApprovedIncident({
            incidentId: appr.incident.incidentId,
            service: appr.incident.service,
            rootCause: appr.incident.rootCause || appr.reasoning,
            assignedTo: appr.assignedTo,
          });
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      await api.postApprovalDecision(approvalId, decision);
      loadApprovals();
      setSelectedId(null);
      if (decision === 'APPROVED') {
        // Transition demo flow: show compliance post-mortem
        setTimeout(() => setShowPostMortem(true), 600);
      }
    } catch (e) {
      alert('Error updating approval status: ' + e);
    } finally {
      setProcessingId(null);
    }
  }

  const selected = approvals.find(a => a.id === selectedId)
  const pendingCount = approvals.filter(a => a.status === 'PENDING').length

  return (
    <div style={{ maxWidth: 1400, display: 'flex', flexDirection: 'column', gap: 12 }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="section-title">DevOps Approval Center</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {pendingCount} pending authorization requests requiring human validation
          </div>
        </div>
        <div className="badge high" style={{ padding: '4px 10px' }}>
          <AlertTriangle size={12} style={{ marginRight: 4 }} /> {pendingCount} PENDING
        </div>
      </div>

      {/* Safety Gating Policy Warning */}
      <div className="card" style={{ borderLeft: '3px solid var(--color-warn-text)', background: 'rgba(245, 158, 11, 0.02)', padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <ShieldCheck size={16} style={{ color: 'var(--color-warn-text)', marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warn-text)' }}>Human-in-the-Loop Safety Policy</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
              Gated Execution Policy: Modifying or restarting staging and production microservices are classified as high risk. Explicit credential confirmation is required.
            </div>
          </div>
        </div>
      </div>

      {/* Authenticating Gate spinner */}
      {processingId && (
        <div className="card animate-in" style={{ borderLeft: '3px solid var(--color-info-text)', background: 'rgba(59, 130, 246, 0.02)', padding: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-info-text)' }}>SAFE_AUTH_GATE: VERIFYING_DEVOPS_TOKEN</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Confirming active session key and signing security envelope...</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40 }}>
          <div className="skeleton" style={{ height: 100, width: '100%', marginBottom: 15 }} />
          <div className="skeleton" style={{ height: 100, width: '100%' }} />
        </div>
      ) : approvals.length === 0 ? (
        <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
          No approval requests index.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1fr 1.2fr' : '1fr', gap: 12 }}>
          
          {/* List panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {approvals.map(approval => (
              <div
                key={approval.id}
                onClick={() => setSelectedId(approval.id)}
                className="card"
                style={{
                  margin: 0,
                  cursor: 'pointer',
                  borderColor: selectedId === approval.id ? 'var(--color-info-text)' : undefined,
                  backgroundColor: selectedId === approval.id ? 'rgba(59, 130, 246, 0.01)' : undefined,
                  padding: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span className="incident-id" style={{ fontSize: 11 }}>{approval.incident.incidentId}</span>
                    <h4 style={{ fontSize: 13.5, fontWeight: 500, color: '#fff', marginTop: 2 }}>{approval.incident.title}</h4>
                  </div>
                  <span className={`badge ${approval.status === 'PENDING' ? 'pending' : approval.status === 'APPROVED' ? 'resolved' : 'high'}`}>
                    {approval.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                  <span>SEVERITY: <span className={`badge ${approval.incident.severity.toLowerCase()}`} style={{ fontSize: 8, padding: '1px 4px' }}>{approval.incident.severity}</span></span>
                  <span>RISK: <span className={`badge ${approval.riskLevel.toLowerCase() === 'high' ? 'high' : 'low'}`} style={{ fontSize: 8, padding: '1px 4px' }}>{approval.riskLevel}</span></span>
                  <span>CONFIDENCE: <span style={{ color: 'var(--color-success-text)' }}>{approval.aiConfidence}%</span></span>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
                  <span className="section-title" style={{ fontSize: 9.5, display: 'block', marginBottom: 2 }}>Recommended Remediation Action</span>
                  {approval.recommendedAction}
                </div>

                {approval.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      className="btn btn-approve" 
                      onClick={e => { e.stopPropagation(); handleDecision(approval.id, 'APPROVED') }}
                      disabled={processingId !== null}
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      APPROVE
                    </button>
                    <button 
                      className="btn btn-reject" 
                      onClick={e => { e.stopPropagation(); handleDecision(approval.id, 'REJECTED') }}
                      disabled={processingId !== null}
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      REJECT
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={e => { e.stopPropagation(); navigate(`/incidents/${approval.incident.id}`) }}
                      disabled={processingId !== null}
                      style={{ padding: '4px 10px', fontSize: 11, marginLeft: 'auto' }}
                    >
                      <ExternalLink size={11} /> REVIEW
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Details panel */}
          {selected && (
            <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={14} style={{ color: 'var(--color-info-text)' }} />
                <span className="section-title" style={{ fontSize: 10.5 }}>AI Root Cause Synthesis & Reasoning</span>
              </div>

              {/* Sarvam/ElevenLabs Voice Escalate Briefing */}
              <AudioBriefing 
                incidentId={selected.incident.incidentId}
                service={selected.incident.service}
                rootCause={selected.incident.rootCause || selected.reasoning}
                recommendedAction={selected.recommendedAction}
                assignedTo={selected.assignedTo}
              />

              <div className="metadata-grid" style={{ marginBottom: 4 }}>
                <div className="metadata-row">
                  <span className="metadata-label">Incident ID</span>
                  <span className="metadata-value">{selected.incident.incidentId}</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">Target Service</span>
                  <span className="metadata-value">{selected.incident.service}</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">AI Confidence</span>
                  <span className="metadata-value" style={{ color: 'var(--color-success-text)' }}>{selected.aiConfidence}%</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">Remediation Risk</span>
                  <span className={`badge ${selected.riskLevel.toLowerCase() === 'high' ? 'high' : selected.riskLevel.toLowerCase() === 'critical' ? 'critical' : 'low'}`} style={{ fontSize: 8 }}>{selected.riskLevel}</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">Escalated To</span>
                  <span className="metadata-value">{selected.assignedTo}</span>
                </div>
              </div>

              {/* Kubernetes dry run terminal & config diff */}
              <div>
                <div className="section-title" style={{ fontSize: 9.5, marginBottom: 6 }}>Sandbox Dry-Run Verification</div>
                <TerminalSandbox 
                  incidentId={selected.incident.incidentId}
                  service={selected.incident.service}
                  rootCause={selected.incident.rootCause || selected.reasoning}
                  recommendedAction={selected.recommendedAction}
                />
              </div>

              <div style={{ marginBottom: 4 }}>
                <div className="section-title" style={{ fontSize: 9.5, marginBottom: 4 }}>RCA Synthesis Reasoning</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {selected.reasoning}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div className="section-title" style={{ fontSize: 9.5, marginBottom: 6 }}>Telemetry Evidence</div>
                {selected.evidence.map((e, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 11.5, color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={12} style={{ color: 'var(--color-success-text)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{e}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="section-title" style={{ fontSize: 9.5, marginBottom: 6 }}>Affected Microservice Entities</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {selected.affectedServices.map((s, idx) => (
                    <span key={idx} className="badge low" style={{ fontSize: 8 }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SOC2 Compliance Post-Mortem: auto-shown after approval */}
      {showPostMortem && (
        <div style={{ marginTop: 4 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 10,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e', letterSpacing: '0.12em' }}>
              ▶ REMEDIATION AUTHORIZED · COMPLIANCE AUDIT AUTO-GENERATED
            </div>
            <button
              onClick={() => setShowPostMortem(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
          <CompliancePostMortem 
            incidentId={approvedIncident?.incidentId || selected?.incident.incidentId}
            service={approvedIncident?.service || selected?.incident.service}
            rootCause={approvedIncident?.rootCause || selected?.incident.rootCause}
            assignedTo={approvedIncident?.assignedTo || selected?.assignedTo}
          />
        </div>
      )}
    </div>
  )
}
