import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { api } from '../utils/api'

interface IncidentReportData {
  id: string;
  incidentId: string;
  content: string;
  generatedAt: string;
}

interface IncidentDetailData {
  id: string;
  incidentId: string;
  title: string;
  service: string;
  environment: string;
  severity: string;
  status: string;
  confidence: number | null;
  rootCause: string | null;
  assignedTo: string;
  createdAt: string;
}

export default function IncidentReport() {
  const { incidentId } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState<IncidentDetailData | null>(null)
  const [report, setReport] = useState<IncidentReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReportData() {
      if (!incidentId) return;
      try {
        const inc = await api.getIncident(incidentId);
        setIncident(inc);

        const rep = await api.getReport(inc.incidentId).catch(() => null);
        setReport(rep);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, [incidentId]);

  const handleDownload = () => {
    if (!incident) return;
    
    const reportText = report ? report.content : `
SENTINELOPS AI - INCIDENT REPORT
================================

Incident ID:     ${incident.incidentId}
Title:           ${incident.title}
Service:         ${incident.service}
Environment:     ${incident.environment}
Severity:        ${incident.severity}
Status:          ${incident.status}
Created:         ${incident.createdAt}
Assigned To:     ${incident.assignedTo}

DIAGNOSIS
---------
Root Cause:      ${incident.rootCause || 'N/A'}
AI Confidence:   ${incident.confidence || 'N/A'}%

Status: Pending AI Investigation Report Generation.
`.trim()

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${incident.incidentId}_report.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderParsedReportContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Bold syntax helper: replaces **text** with <strong>text</strong> inline
      const renderFormattedText = (text: string) => {
        const parts = text.split(/\*\*([^*]+)\*\*/g);
        return parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part}</strong> : part);
      };

      // Headers
      if (line.startsWith('# ')) {
        return (
          <h2 key={index} style={{ fontSize: 18, fontWeight: 800, marginTop: 24, marginBottom: 12, color: 'var(--text-primary)', letterSpacing: '-0.3px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
            {line.replace('# ', '')}
          </h2>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} style={{ fontSize: 13, fontWeight: 700, marginTop: 20, marginBottom: 8, color: 'var(--sentinel-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {line.replace('## ', '')}
          </h3>
        );
      }
      // List items
      if (line.startsWith('- ')) {
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0', fontSize: 13.5, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--sentinel-cyan)', fontWeight: 'bold', marginTop: 2 }}>•</span>
            <span>{renderFormattedText(line.replace('- ', ''))}</span>
          </div>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0', fontSize: 13.5, paddingLeft: 12, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--sentinel-cyan)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{line.match(/^\d+\./)?.[0]}</span>
            <span>{renderFormattedText(line.replace(/^\d+\.\s/, ''))}</span>
          </div>
        );
      }
      // Horizontal dividers
      if (line === '---') {
        return <hr key={index} className="divider" style={{ margin: '16px 0' }} />;
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={index} style={{ height: 8 }} />;
      }
      // Standard line
      return (
        <p key={index} style={{ margin: '4px 0', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {renderFormattedText(line)}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <div className="skeleton" style={{ height: 60, width: '100%', marginBottom: 15 }} />
        <div className="skeleton" style={{ height: 200, width: '100%' }} />
      </div>
    )
  }

  if (!incident) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Incident not found</div>
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                 display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Report Header */}
      <div className="report-container animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <FileText size={22} style={{ color: 'var(--sentinel-cyan)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sentinel-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                SentinelOps AI — Incident Report
              </span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>
              {incident.incidentId} — {incident.title}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Generated automatically by SentinelOps AI Agent · {report ? new Date(report.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px 14px' }} onClick={handleDownload}>
              <Download size={14} /> Download Report
            </button>
          </div>
        </div>

        <hr className="divider" />

        {/* Incident Details */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--sentinel-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Incident Details
          </h3>
          <div className="report-field">
            <span className="report-label">Incident ID</span>
            <span className="report-value" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{incident.incidentId}</span>
          </div>
          <div className="report-field">
            <span className="report-label">Service</span>
            <span className="report-value">{incident.service}</span>
          </div>
          <div className="report-field">
            <span className="report-label">Environment</span>
            <span className="report-value">{incident.environment}</span>
          </div>
          <div className="report-field">
            <span className="report-label">Severity</span>
            <span className={`badge ${incident.severity.toLowerCase()}`}>{incident.severity}</span>
          </div>
          <div className="report-field">
            <span className="report-label">Status</span>
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
          <div className="report-field">
            <span className="report-label">Assigned To</span>
            <span className="report-value">{incident.assignedTo}</span>
          </div>
        </div>

        {/* Report Content parsed */}
        {report ? (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--sentinel-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI Analysis & Findings
            </h3>
            <div style={{ 
              background: 'var(--bg-glass-light)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 10, 
              padding: 24, 
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              fontSize: 14
            }}>
              {renderParsedReportContent(report.content)}
            </div>
          </div>
        ) : (
          <div style={{
            padding: 30, background: 'rgba(245,158,11,0.05)', border: '1px dashed rgba(245,158,11,0.2)',
            borderRadius: 10, textAlign: 'center', color: 'var(--sentinel-amber)', fontSize: 14
          }}>
            AI Agent has not finished generating the comprehensive incident report. Check back once investigation reaches ROOT_CAUSE_IDENTIFIED.
          </div>
        )}

        <hr className="divider" />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Assigned Team: <strong style={{ color: 'var(--text-secondary)' }}>DevOps Team</strong>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Report powered by <span className="text-gradient" style={{ fontWeight: 700 }}>SentinelOps AI Agent</span>
          </div>
        </div>
      </div>
    </div>
  )
}
