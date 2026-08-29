import { useState } from 'react'
import { CheckCircle2, Download, Shield, Clock, Cpu, AlertTriangle, FileText } from 'lucide-react'

interface CompliancePostMortemProps {
  incidentId?: string;
  service?: string;
  rootCause?: string;
  assignedTo?: string;
}

const TYPE_COLORS = {
  info:    { border: 'rgba(59, 130, 246, 0.5)', dot: '#3b82f6', label: '#93c5fd' },
  warn:    { border: 'rgba(245, 158, 11, 0.5)', dot: '#f59e0b', label: '#fbbf24' },
  success: { border: 'rgba(34, 197, 94, 0.5)',  dot: '#22c55e', label: '#86efac' },
}

const SOC2_CONTROLS = [
  { id: 'CC6.1', desc: 'Logical & physical access controls', status: 'PASS' },
  { id: 'CC6.6', desc: 'Human-in-the-loop gate for prod writes', status: 'PASS' },
  { id: 'CC7.2', desc: 'System monitoring & anomaly detection', status: 'PASS' },
  { id: 'CC7.4', desc: 'Incident response & recovery procedures', status: 'PASS' },
  { id: 'CC8.1', desc: 'Change management process', status: 'PASS' },
  { id: 'A1.2',  desc: 'System availability SLA compliance', status: 'PASS' },
]

export default function CompliancePostMortem({
  incidentId = 'INC-2048',
  service = 'Staging API',
  rootCause = 'Database connection pool exhaustion',
  assignedTo = 'DevOps Team'
}: CompliancePostMortemProps) {
  const [downloading, setDownloading] = useState(false)
  const resolutionTime = '14 min 32 sec'

  const auditSteps = [
    {
      ts: '14:02:11.452',
      actor: 'SENTINEL_AI',
      action: 'INTENT_DETECTION',
      detail: `Telemetry anomaly detected on ${service}. Autonomous SRE agent pipeline initialized. Confidence: 98.1%.`,
      type: 'info' as const,
    },
    {
      ts: '14:02:12.100',
      actor: 'POLICY_GATE',
      action: 'SAFETY_GATE_TRIGGERED',
      detail: `Classification: ${service} remediation. Risk tier: HIGH. Human-in-the-loop gate activated per SOC2 CC6.6.`,
      type: 'warn' as const,
    },
    {
      ts: '14:02:13.510',
      actor: 'RAG_ENGINE',
      action: 'KNOWLEDGE_RETRIEVAL',
      detail: `Retrieved matching SOP runbooks for ${service}. Top match relevance: 94.2%.`,
      type: 'info' as const,
    },
    {
      ts: '14:02:15.881',
      actor: 'SENTINEL_AI',
      action: 'ROOT_CAUSE_DIAGNOSIS',
      detail: `Root cause identified: ${rootCause}. System telemetry & logs correlated.`,
      type: 'success' as const,
    },
    {
      ts: '14:02:17.004',
      actor: 'BLAST_RADIUS_ENGINE',
      action: 'IMPACT_GRAPH_COMPUTED',
      detail: `Downstream impact mapped: ${service} and interconnected dependencies evaluated.`,
      type: 'warn' as const,
    },
    {
      ts: '14:02:19.233',
      actor: 'TERMINAL_SANDBOX',
      action: 'DRY_RUN_EXECUTED',
      detail: `Automated dry-run simulation verified for ${service}. 0 schema validation errors.`,
      type: 'info' as const,
    },
    {
      ts: '14:03:44.100',
      actor: 'DEVOPS_ENGINEER',
      action: 'HUMAN_APPROVAL_GRANTED',
      detail: `Remediation authorized by ${assignedTo}. Auth token: sha256:a4f1...8c2e. Session ID: SES-7829.`,
      type: 'success' as const,
    },
    {
      ts: '14:03:44.501',
      actor: 'SENTINEL_AI',
      action: 'REMEDIATION_EXECUTION',
      detail: `Remediation applied to ${service}. All instances healthy in 47s.`,
      type: 'success' as const,
    },
    {
      ts: '14:04:33.820',
      actor: 'MONITOR',
      action: 'HEALTH_CHECK_PASS',
      detail: `Anomaly resolved. Error rates normalized below threshold. All service health checks nominal.`,
      type: 'success' as const,
    },
    {
      ts: '14:16:43.001',
      actor: 'COMPLIANCE_ENGINE',
      action: 'SOC2_AUDIT_GENERATED',
      detail: `This report auto-generated. Immutable audit trail committed to append-only log store. Report ID: RPT-${incidentId}-SOC2.`,
      type: 'info' as const,
    },
  ];

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => setDownloading(false), 1800)
  }

  return (
    <div style={{
      background: 'rgba(24, 28, 40, 0.98)',
      border: '1px solid rgba(34, 197, 94, 0.25)',
      borderRadius: 8,
      overflow: 'hidden',
      fontFamily: 'var(--font-mono)',
    }}>
      {/* Document Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(59, 130, 246, 0.04))',
        borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
        padding: '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Shield size={14} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: 9, letterSpacing: '0.15em', color: '#22c55e', textTransform: 'uppercase' }}>
              SOC2 TYPE II · AUTOMATED AUDIT REPORT
            </span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)', letterSpacing: '-0.3px' }}>
            Incident Post-Mortem · {incidentId}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {service} · {rootCause} · {resolutionTime} MTTR
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <button
            onClick={handleDownload}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              borderRadius: 4,
              padding: '5px 12px',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: '0.05em',
            }}
          >
            <Download size={11} />
            {downloading ? 'GENERATING...' : 'DOWNLOAD PDF'}
          </button>
          <div style={{ fontSize: 8, color: 'var(--text-secondary)' }}>Report ID: RPT-{incidentId}-SOC2</div>
        </div>
      </div>

      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Executive Summary */}
        <div>
          <div style={{
            fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-secondary)',
            textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <FileText size={10} /> Executive Summary
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 5,
            padding: '10px 14px',
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.65,
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              On <strong style={{ color: '#fff' }}>2026-08-29 at 14:02 UTC</strong>, SentinelOps AI autonomously
              detected and resolved an incident affecting <strong style={{ color: '#fff' }}>{service}</strong> ({incidentId}).
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong style={{ color: '#f59e0b' }}>Root Cause:</strong> {rootCause}.
            </p>
            <p style={{ margin: 0 }}>
              The AI agent orchestrated a full remediation cycle — RAG runbook retrieval, telemetry correlation,
              sandbox dry-run verification, human authorization gate by <strong style={{ color: '#fff' }}>{assignedTo}</strong>,
              and live rollout execution — achieving a <strong style={{ color: '#22c55e' }}>time-to-resolution of {resolutionTime}</strong>{' '}
              with zero unauthorized automated writes to production.
            </p>
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
        }}>
          {[
            { label: 'MTTR', value: resolutionTime, color: '#22c55e', icon: <Clock size={12} /> },
            { label: 'TARGET SERVICE', value: service, color: '#38bdf8', icon: <Cpu size={12} /> },
            { label: 'AI CONFIDENCE', value: '94.2%', color: '#38bdf8', icon: <Cpu size={12} /> },
            { label: 'CONTROLS VERIFIED', value: '6/6', color: '#22c55e', icon: <Shield size={12} /> },
          ].map(m => (
            <div key={m.label} style={{
              background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 5, padding: '8px 10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, color: m.color }}>
                {m.icon}
                <span style={{ fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{m.label}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Audit Timeline */}
        <div>
          <div style={{
            fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-secondary)',
            textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Clock size={10} /> Millisecond-Precision AI Action Timeline
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 5,
            padding: '4px 0',
            maxHeight: 340,
            overflowY: 'auto',
          }}>
            {auditSteps.map((step, i) => {
              const c = TYPE_COLORS[step.type]
              return (
                <div key={i} style={{
                  display: 'flex',
                  gap: 0,
                  borderBottom: i < auditSteps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  padding: '6px 12px',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 10, paddingTop: 3 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: c.dot, flexShrink: 0,
                      boxShadow: `0 0 5px ${c.dot}`,
                    }} />
                    {i < auditSteps.length - 1 && (
                      <div style={{ width: 1, flexGrow: 1, background: 'rgba(255,255,255,0.07)', marginTop: 3, minHeight: 16 }} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 9, color: '#6ee7b7', letterSpacing: '0.05em' }}>[{step.ts}]</span>
                      <span style={{ fontSize: 8, color: 'var(--text-secondary)', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 8 }}>
                        {step.actor}
                      </span>
                      <span style={{
                        fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em',
                        color: c.label, textTransform: 'uppercase',
                        border: `1px solid ${c.border}`, borderRadius: 3, padding: '0 5px',
                      }}>
                        {step.action}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                      {step.detail}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SOC2 Controls Checklist */}
        <div>
          <div style={{
            fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-secondary)',
            textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Shield size={10} /> SOC2 Trust Controls Verification
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5,
          }}>
            {SOC2_CONTROLS.map(ctrl => (
              <div key={ctrl.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 10px',
                background: 'rgba(34, 197, 94, 0.04)', border: '1px solid rgba(34, 197, 94, 0.15)',
                borderRadius: 4,
              }}>
                <CheckCircle2 size={12} style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#22c55e' }}>{ctrl.id}</div>
                  <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{ctrl.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Attestation */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
            Generated by <span style={{ color: '#22c55e' }}>SentinelOps AI v2.1</span> ·
            Immutable audit log · Report ID: <span style={{ color: 'rgba(255,255,255,0.4)' }}>RPT-{incidentId}-SOC2</span>
          </div>
          <div style={{
            fontSize: 9, color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 3,
            padding: '2px 8px',
          }}>
            ✓ COMPLIANCE READY
          </div>
        </div>
      </div>
    </div>
  )
}
