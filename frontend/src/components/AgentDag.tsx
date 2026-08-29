import { useState, useEffect } from 'react';
import { Play, FileCode, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  sublabel: string;
  status: 'idle' | 'active' | 'completed';
  x: number;
  y: number;
  payload: any;
}

interface AgentDagProps {
  status: string;
  autoAnimate?: boolean;
}

export default function AgentDag({ status, autoAnimate = false }: AgentDagProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Nodes data and coordinates for SVG layout
  const nodesData: Omit<Node, 'status'>[] = [
    {
      id: 'intent',
      label: '1. Detect Intent',
      sublabel: 'Kannada NLP',
      x: 100,
      y: 80,
      payload: {
        agent: 'IndicNLPClassifierAgent',
        sponsor: 'Sarvam AI / Anthropic API',
        input: 'ನಮ್ಮ staging API ನಲ್ಲಿ 500 error ಬರುತ್ತಿದೆ. ಏನು ಸಮಸ್ಯೆ?',
        extracted_metadata: {
          detected_language: 'kn-IN',
          language_confidence: 0.998,
          intent: 'infrastructure_anomaly',
          entities: {
            service: 'staging API',
            error_code: 500
          }
        }
      }
    },
    {
      id: 'classify',
      label: '2. Classify Incident',
      sublabel: 'Categorizer & Severity',
      x: 300,
      y: 80,
      payload: {
        agent: 'TriageOrchestrator',
        mcp_servers: ['freshworks-ticket-mcp', 'datadog-observability-mcp'],
        classification: {
          category: 'HTTP_500_API_FAILURE',
          target_service: 'Staging API Gateway',
          severity: 'HIGH',
          escalation_sla: '30m'
        }
      }
    },
    {
      id: 'sop',
      label: '3. SOP Runbook Retrieval',
      sublabel: 'Vector DB RAG Query',
      x: 500,
      y: 80,
      payload: {
        agent: 'KnowledgeRetrievalService',
        vector_db: 'ChromaDB Local Vector Server',
        search_query: 'database connection pool HTTP 500 timeout staging API',
        matches: [
          { title: 'Database Connection Pool Runbook', relevance: 94, category: 'Runbook' },
          { title: 'Incident INC-1842 Post-Mortem', relevance: 91, category: 'Post-Mortem' }
        ]
      }
    },
    {
      id: 'telemetry',
      label: '4. Telemetry Correlation',
      sublabel: 'Logs & Metrics Analyzer',
      x: 500,
      y: 220,
      payload: {
        agent: 'ObservabilityCollectorAgent',
        mcp_tools: ['get_datadog_metrics', 'get_kubernetes_pod_logs'],
        analyzed_telemetry: {
          total_logs: 127,
          errors_count: 5,
          db_connections_utilization: '98% (saturated)',
          cpu_utilization: '92% (danger)',
          memory_utilization: '89% (warning)'
        }
      }
    },
    {
      id: 'historical',
      label: '5. Historical Correlation',
      sublabel: 'Pattern Matching Engine',
      x: 300,
      y: 220,
      payload: {
        agent: 'CorrelationModelService',
        algorithm: 'Levensthein Vector Similarity',
        query_pattern: 'database_connection_saturation_http_500',
        correlation: {
          matched_incident: 'INC-1842',
          similarity_score: 0.91,
          past_remediation: 'Restart API instances & scale pool capacity'
        }
      }
    },
    {
      id: 'diagnose',
      label: '6. Root Cause Diagnosis',
      sublabel: 'LLM Reasoning Core',
      x: 100,
      y: 220,
      payload: {
        agent: 'SentinelOpsDiagnosisAgent',
        llm_model: 'claude-3-5-sonnet-20241022',
        reasoning_chain: [
          'DB connections is locked at 98%, blocking new inbound API threads.',
          'HTTP 500 logs explicitly mention connection acquisition timeout.',
          'Matches historical pattern of INC-1842.'
        ],
        diagnosis: {
          root_cause: 'Database connection pool exhaustion',
          confidence_score: 94,
          remediation_action: 'RESTART_STAGING_API_GATEWAY'
        }
      }
    },
    {
      id: 'gate',
      label: '7. Policy Safety Gate',
      sublabel: 'Human-in-the-Loop Auth',
      x: 100,
      y: 340,
      payload: {
        agent: 'SafetyPolicyGatekeeper',
        rules_checked: [
          { rule: 'no_automated_infrastructure_restart', passed: false, action: 'require_approval' },
          { rule: 'verify_manager_role_claims', passed: true }
        ],
        gating_action: {
          status: 'ESCALATED',
          assigned_to: 'DevOps Manager',
          approval_token: 'auth_token_sig_0x7b12d9f3a',
          revenue_impact_ticking: true
        }
      }
    }
  ];

  // Map status to steps
  useEffect(() => {
    if (autoAnimate && status === 'INVESTIGATING') {
      setActiveStep(1);
      const timers = [
        setTimeout(() => setActiveStep(2), 800),
        setTimeout(() => setActiveStep(3), 1600),
        setTimeout(() => setActiveStep(4), 2400),
        setTimeout(() => setActiveStep(5), 3200),
        setTimeout(() => setActiveStep(6), 4000),
        setTimeout(() => setActiveStep(7), 4800),
      ];
      return () => timers.forEach(clearTimeout);
    } else {
      // Direct status mapping
      if (status === 'NEW') setActiveStep(0);
      else if (status === 'INVESTIGATING') setActiveStep(5);
      else if (status === 'ROOT_CAUSE_IDENTIFIED') setActiveStep(6);
      else if (status === 'REMEDIATION_PENDING') setActiveStep(7);
      else if (status === 'APPROVED' || status === 'RESOLVED') setActiveStep(7);
    }
  }, [status, autoAnimate]);

  const getStatus = (index: number): 'idle' | 'active' | 'completed' => {
    if (activeStep > index) return 'completed';
    if (activeStep === index) return 'active';
    return 'idle';
  };

  const nodes: Node[] = nodesData.map((node, i) => ({
    ...node,
    status: getStatus(i),
  }));

  const drawEdge = (n1: Node, n2: Node) => {
    const isCompleted = n1.status === 'completed' && n2.status !== 'idle';
    const isActive = n1.status === 'completed' && n2.status === 'active';
    
    return (
      <g key={`${n1.id}-${n2.id}`}>
        <path
          d={`M ${n1.x} ${n1.y} L ${n2.x} ${n2.y}`}
          stroke={isCompleted ? 'var(--sentinel-cyan)' : isActive ? 'var(--sentinel-blue)' : 'var(--border-sre)'}
          strokeWidth={2}
          strokeDasharray={isActive ? '4 4' : 'none'}
          className={isActive ? 'dash-animation' : ''}
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {isCompleted && (
          <path
            d={`M ${n1.x} ${n1.y} L ${n2.x} ${n2.y}`}
            stroke="var(--sentinel-cyan)"
            strokeWidth={4}
            opacity={0.15}
          />
        )}
      </g>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10, position: 'relative' }}>
      <div style={{ flex: 1, minHeight: 380, background: 'var(--bg-app)', border: '1px solid var(--border-sre)', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          <Play size={10} className="blink" style={{ color: 'var(--sentinel-cyan)' }} />
          ANTHROPIC_MCP_ORCHESTRATOR_TRACE
        </div>

        <svg width="100%" height="100%" viewBox="0 0 620 420" style={{ padding: 10 }}>
          {drawEdge(nodes[0], nodes[1])}
          {drawEdge(nodes[1], nodes[2])}
          {drawEdge(nodes[2], nodes[3])}
          {drawEdge(nodes[3], nodes[4])}
          {drawEdge(nodes[4], nodes[5])}
          {drawEdge(nodes[5], nodes[6])}

          {nodes.map((node, i) => {
            const isActive = node.status === 'active';
            const isCompleted = node.status === 'completed';
            
            const strokeColor = isCompleted 
              ? 'var(--sentinel-green)' 
              : isActive 
              ? 'var(--sentinel-cyan)' 
              : 'var(--border-sre)';

            const fillColor = isCompleted
              ? 'rgba(16, 185, 129, 0.08)'
              : isActive
              ? 'rgba(6, 182, 212, 0.08)'
              : 'rgba(30, 41, 59, 0.4)';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x - 70}, ${node.y - 25})`}
                onClick={() => setSelectedNode(node)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  width={140}
                  height={50}
                  rx={8}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 2 : 1.2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                
                {isCompleted && (
                  <circle cx={130} cy={10} r={4} fill="var(--sentinel-green)" />
                )}
                {isActive && (
                  <circle cx={130} cy={10} r={4} fill="var(--sentinel-cyan)" className="blink" />
                )}

                <text
                  x={12}
                  y={22}
                  fill={isCompleted || isActive ? '#fff' : 'var(--text-secondary)'}
                  fontSize={10}
                  fontWeight={isActive ? 700 : 600}
                  fontFamily="var(--font-mono)"
                >
                  {node.label.split('. ')[1]}
                </text>
                <text
                  x={12}
                  y={38}
                  fill="var(--text-muted)"
                  fontSize={8.5}
                  fontFamily="var(--font-sans)"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedNode && (
        <div 
          className="animate-in"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid var(--border-sre)',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            padding: 14,
            zIndex: 10,
            maxHeight: '75%',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid var(--border-sre)', paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--sentinel-cyan)' }}>
              <FileCode size={13} />
              {selectedNode.label.toUpperCase()} — PAYLOAD_TRACE
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
          <pre 
            style={{ 
              fontSize: 10, 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--sentinel-green)', 
              background: 'rgba(0, 0, 0, 0.3)', 
              padding: 10, 
              borderRadius: 6, 
              overflowX: 'auto',
              margin: 0
            }}
          >
            {JSON.stringify(selectedNode.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
