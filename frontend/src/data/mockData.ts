// ── Types ──
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'NEW' | 'INVESTIGATING' | 'ROOT_CAUSE_IDENTIFIED' | 'REMEDIATION_PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Language = 'en' | 'kn' | 'hi';

export interface Incident {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  service: string;
  environment: string;
  severity: Severity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  confidence: number | null;
  rootCause: string | null;
  tags: string[];
}

export interface IncidentLog {
  id: string;
  incidentId: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
}

export interface SystemMetric {
  id: string;
  incidentId: string;
  metricName: string;
  value: number;
  unit: string;
  status: 'ok' | 'warning' | 'danger';
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  relevance: number;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  event: string;
  type: 'info' | 'completed' | 'warning' | 'error' | 'active';
}

export interface AIStep {
  id: string;
  text: string;
  status: 'done' | 'active' | 'pending' | 'warning';
}

export interface Approval {
  id: string;
  incidentId: string;
  incident: Incident;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  recommendedAction: string;
  reasoning: string;
  aiConfidence: number;
  assignedTo: string;
  createdAt: string;
  evidence: string[];
  affectedServices: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    language?: string;
    toolsUsed?: string[];
    stepType?: string;
  };
}

// ── Mock Data ──

export const mockIncidents: Incident[] = [
  {
    id: '1',
    incidentId: 'INC-2048',
    title: 'HTTP 500 API Failure',
    description: 'Staging API returning HTTP 500 errors on multiple endpoints. Affecting order processing and user authentication services.',
    service: 'Staging API',
    environment: 'Staging',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    createdAt: '2024-09-01T14:02:00Z',
    updatedAt: '2024-09-01T14:06:00Z',
    assignedTo: 'Rajesh Kumar',
    confidence: 94,
    rootCause: 'Database connection pool exhaustion',
    tags: ['api', 'database', 'staging'],
  },
  {
    id: '2',
    incidentId: 'INC-2049',
    title: 'Redis Cache Latency Spike',
    description: 'Production Redis cluster experiencing intermittent latency spikes exceeding 200ms. Affecting session management.',
    service: 'Redis Cluster',
    environment: 'Production',
    severity: 'MEDIUM',
    status: 'INVESTIGATING',
    createdAt: '2024-09-01T13:45:00Z',
    updatedAt: '2024-09-01T14:00:00Z',
    assignedTo: 'Priya Sharma',
    confidence: 78,
    rootCause: 'Memory fragmentation in Redis cluster',
    tags: ['redis', 'cache', 'latency'],
  },
  {
    id: '3',
    incidentId: 'INC-2047',
    title: 'SSL Certificate Expiry Warning',
    description: 'SSL certificate for api.staging.internal expiring in 7 days. Requires renewal before Sept 8.',
    service: 'API Gateway',
    environment: 'Staging',
    severity: 'LOW',
    status: 'RESOLVED',
    createdAt: '2024-08-31T09:00:00Z',
    updatedAt: '2024-08-31T10:30:00Z',
    assignedTo: 'Arun Patel',
    confidence: 99,
    rootCause: 'Automated renewal failed due to DNS propagation delay',
    tags: ['ssl', 'certificate', 'security'],
  },
  {
    id: '4',
    incidentId: 'INC-2050',
    title: 'Kubernetes Pod CrashLoopBackOff',
    description: 'Payment service pods in production entering CrashLoopBackOff state after latest deployment.',
    service: 'Payment Service',
    environment: 'Production',
    severity: 'CRITICAL',
    status: 'REMEDIATION_PENDING',
    createdAt: '2024-09-01T14:15:00Z',
    updatedAt: '2024-09-01T14:20:00Z',
    assignedTo: 'Deepak Hegde',
    confidence: 88,
    rootCause: 'Out-of-memory kill due to memory leak in v2.4.1',
    tags: ['kubernetes', 'payment', 'crash'],
  },
  {
    id: '5',
    incidentId: 'INC-2046',
    title: 'CDN Cache Invalidation Failure',
    description: 'CloudFront cache invalidation requests failing intermittently. Static assets showing stale content.',
    service: 'CDN',
    environment: 'Production',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '2024-08-30T16:00:00Z',
    updatedAt: '2024-08-30T17:45:00Z',
    assignedTo: 'Sneha Rao',
    confidence: 92,
    rootCause: 'AWS API rate limiting on invalidation requests',
    tags: ['cdn', 'cache', 'aws'],
  },
  {
    id: '6',
    incidentId: 'INC-2051',
    title: 'Database Replication Lag',
    description: 'PostgreSQL read replica showing 45s replication lag. Read-heavy queries returning stale data.',
    service: 'PostgreSQL',
    environment: 'Production',
    severity: 'HIGH',
    status: 'NEW',
    createdAt: '2024-09-01T14:30:00Z',
    updatedAt: '2024-09-01T14:30:00Z',
    assignedTo: 'Unassigned',
    confidence: null,
    rootCause: null,
    tags: ['database', 'replication', 'postgresql'],
  },
];

export const mockLogs: IncidentLog[] = [
  { id: '1', incidentId: 'INC-2048', timestamp: '14:02:11', level: 'INFO', message: 'Request received GET /api/orders', source: 'STAGING-API-01' },
  { id: '2', incidentId: 'INC-2048', timestamp: '14:02:12', level: 'INFO', message: 'Authentication token validated', source: 'STAGING-API-01' },
  { id: '3', incidentId: 'INC-2048', timestamp: '14:02:13', level: 'WARN', message: 'Database connection pool utilization at 91%', source: 'PROD-DB-01' },
  { id: '4', incidentId: 'INC-2048', timestamp: '14:02:14', level: 'ERROR', message: 'Connection pool exhausted - cannot acquire connection', source: 'PROD-DB-01' },
  { id: '5', incidentId: 'INC-2048', timestamp: '14:02:14', level: 'ERROR', message: 'Database connection timeout after 30000ms', source: 'STAGING-API-01' },
  { id: '6', incidentId: 'INC-2048', timestamp: '14:02:15', level: 'ERROR', message: 'Failed to acquire database connection from pool', source: 'STAGING-API-01' },
  { id: '7', incidentId: 'INC-2048', timestamp: '14:02:15', level: 'ERROR', message: 'Unhandled exception in OrderController.getOrders()', source: 'STAGING-API-01' },
  { id: '8', incidentId: 'INC-2048', timestamp: '14:02:16', level: 'ERROR', message: 'HTTP 500 Internal Server Error - GET /api/orders', source: 'STAGING-API-01' },
  { id: '9', incidentId: 'INC-2048', timestamp: '14:02:18', level: 'WARN', message: 'Request queue depth increasing: 47 pending requests', source: 'STAGING-API-01' },
  { id: '10', incidentId: 'INC-2048', timestamp: '14:02:19', level: 'ERROR', message: 'HTTP 500 Internal Server Error - POST /api/auth/login', source: 'STAGING-API-01' },
  { id: '11', incidentId: 'INC-2048', timestamp: '14:02:21', level: 'WARN', message: 'Database connection pool utilization at 96%', source: 'PROD-DB-01' },
  { id: '12', incidentId: 'INC-2048', timestamp: '14:02:22', level: 'ERROR', message: 'Connection pool exhausted - all 50 connections in use', source: 'PROD-DB-01' },
  { id: '13', incidentId: 'INC-2048', timestamp: '14:02:24', level: 'ERROR', message: 'HTTP 500 Internal Server Error - GET /api/products', source: 'STAGING-API-01' },
  { id: '14', incidentId: 'INC-2048', timestamp: '14:02:25', level: 'WARN', message: 'Health check endpoint degraded - response time 4200ms', source: 'STAGING-API-01' },
  { id: '15', incidentId: 'INC-2048', timestamp: '14:02:28', level: 'ERROR', message: 'Circuit breaker OPEN for database service', source: 'STAGING-API-01' },
];

export const mockMetrics: SystemMetric[] = [
  { id: '1', incidentId: 'INC-2048', metricName: 'CPU Usage', value: 92, unit: '%', status: 'danger' },
  { id: '2', incidentId: 'INC-2048', metricName: 'Memory Usage', value: 89, unit: '%', status: 'danger' },
  { id: '3', incidentId: 'INC-2048', metricName: 'Disk I/O', value: 67, unit: '%', status: 'warning' },
  { id: '4', incidentId: 'INC-2048', metricName: 'DB Connections', value: 98, unit: '%', status: 'danger' },
  { id: '5', incidentId: 'INC-2048', metricName: 'HTTP 500 Rate', value: 18.4, unit: '%', status: 'danger' },
  { id: '6', incidentId: 'INC-2048', metricName: 'Avg Response Time', value: 4.8, unit: 's', status: 'danger' },
];

export const mockKnowledgeDocs: KnowledgeDocument[] = [
  {
    id: '1',
    title: 'Database Connection Pool Runbook',
    category: 'Runbook',
    content: 'This runbook covers procedures for diagnosing and resolving database connection pool issues. Key steps include: 1) Check active connections using pg_stat_activity 2) Identify long-running queries 3) Verify pool configuration (max_connections, idle_timeout) 4) Monitor connection churn rate 5) Restart affected services if pool is unrecoverable.',
    relevance: 94,
    createdAt: '2024-06-15',
  },
  {
    id: '2',
    title: 'Incident INC-1842 Post-Mortem',
    category: 'Post-Mortem',
    content: 'Root cause: Database connection pool exhaustion due to unclosed connections in the order processing microservice. Resolution: Updated connection pool max_idle_time from 300s to 60s, added connection leak detection, deployed hotfix v1.8.3. Time to resolution: 47 minutes.',
    relevance: 91,
    createdAt: '2024-07-22',
  },
  {
    id: '3',
    title: 'Production Change Management Policy',
    category: 'Policy',
    content: 'All production changes require: 1) Approved change request ticket 2) Risk assessment (Low/Medium/High) 3) Rollback plan 4) DevOps manager approval for High-risk changes 5) Maintenance window for infrastructure modifications 6) Post-change verification checklist.',
    relevance: 87,
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    title: 'HTTP 500 Troubleshooting Guide',
    category: 'Guide',
    content: 'Step-by-step troubleshooting for HTTP 500 errors: 1) Check application logs for stack traces 2) Verify database connectivity 3) Check external service dependencies 4) Review recent deployments 5) Monitor system resources (CPU, memory, disk) 6) Check connection pool health 7) Verify configuration files.',
    relevance: 89,
    createdAt: '2024-04-20',
  },
  {
    id: '5',
    title: 'Staging Infrastructure Architecture',
    category: 'Documentation',
    content: 'Staging environment mirrors production with reduced capacity. Components: 2x API servers (STAGING-API-01, STAGING-API-02), 1x PostgreSQL primary (STAGING-DB-01), 1x Redis cache (STAGING-REDIS-01), Nginx load balancer. Database: PostgreSQL 15, max_connections=100, connection pool max=50.',
    relevance: 82,
    createdAt: '2024-05-05',
  },
  {
    id: '6',
    title: 'API Gateway Troubleshooting Guide',
    category: 'Guide',
    content: 'Common API Gateway issues: 1) Rate limiting - check X-RateLimit headers 2) Authentication failures - verify JWT token configuration 3) Timeout errors - increase upstream timeout settings 4) 502/503 errors - check backend service health 5) SSL/TLS issues - verify certificate chain.',
    relevance: 76,
    createdAt: '2024-02-28',
  },
  {
    id: '7',
    title: 'DevOps Escalation Policy',
    category: 'Policy',
    content: 'Escalation matrix: P1 (Critical) - Immediate page to on-call + DevOps Manager, 15min response SLA. P2 (High) - Page on-call engineer, 30min response SLA. P3 (Medium) - Slack notification to team channel, 2hr response SLA. P4 (Low) - Ticket creation, next business day response.',
    relevance: 84,
    createdAt: '2024-01-15',
  },
  {
    id: '8',
    title: 'Database Recovery Procedures',
    category: 'Runbook',
    content: 'Emergency database recovery: 1) Identify failure type (connection, corruption, replication) 2) For connection issues: restart connection pooler, verify pg_bouncer 3) For corruption: initiate point-in-time recovery from WAL 4) For replication lag: check network, rebuild replica if necessary 5) Always notify DBA team.',
    relevance: 79,
    createdAt: '2024-05-20',
  },
];

export const mockTimeline: TimelineEvent[] = [
  { id: '1', time: '14:02', event: 'Incident detected — HTTP 500 error rate exceeded threshold', type: 'error' },
  { id: '2', time: '14:02', event: 'AI investigation initiated automatically', type: 'active' },
  { id: '3', time: '14:03', event: 'Language detected: Kannada — responding in user language', type: 'info' },
  { id: '4', time: '14:03', event: 'Incident classified: HTTP 500 API Failure (Severity: HIGH)', type: 'warning' },
  { id: '5', time: '14:03', event: 'Retrieved 4 relevant knowledge base documents', type: 'completed' },
  { id: '6', time: '14:04', event: 'Analyzed 127 log entries from STAGING-API-01', type: 'completed' },
  { id: '7', time: '14:04', event: 'System metrics correlated — CPU 92%, DB Connections 98%', type: 'warning' },
  { id: '8', time: '14:05', event: 'Historical match found: INC-1842 (connection pool exhaustion)', type: 'completed' },
  { id: '9', time: '14:05', event: 'Root cause identified: Database connection pool exhaustion (94% confidence)', type: 'completed' },
  { id: '10', time: '14:05', event: 'Remediation plan generated — Risk: HIGH', type: 'warning' },
  { id: '11', time: '14:06', event: 'Human approval requested — escalated to DevOps Manager', type: 'warning' },
];

export const mockAISteps: AIStep[] = [
  { id: '1', text: 'Incident received and language detected (Kannada)', status: 'done' },
  { id: '2', text: 'Classified incident: HTTP 500 API Failure — Severity HIGH', status: 'done' },
  { id: '3', text: 'Retrieved database connection pool runbook (94% relevance)', status: 'done' },
  { id: '4', text: 'Retrieved historical incident INC-1842 post-mortem (91% relevance)', status: 'done' },
  { id: '5', text: 'Analyzed 127 recent log entries from STAGING-API-01', status: 'done' },
  { id: '6', text: 'Detected connection pool saturation pattern in logs', status: 'done' },
  { id: '7', text: 'Correlated system metrics: CPU 92%, Memory 89%, DB Connections 98%', status: 'done' },
  { id: '8', text: 'Compared with previous incident INC-1842 — pattern match confirmed', status: 'done' },
  { id: '9', text: 'Root cause identified: Database connection pool exhaustion', status: 'done' },
  { id: '10', text: 'Confidence score calculated: 94%', status: 'done' },
  { id: '11', text: 'Remediation plan generated with 4 action items', status: 'done' },
  { id: '12', text: 'Risk assessment: HIGH — production infrastructure modification', status: 'warning' },
  { id: '13', text: 'Human approval required — escalated to DevOps Manager', status: 'warning' },
];

export const mockApprovals: Approval[] = [
  {
    id: '1',
    incidentId: 'INC-2048',
    incident: mockIncidents[0],
    riskLevel: 'HIGH',
    status: 'PENDING',
    recommendedAction: 'Restart affected API instances after verifying database health and connection pool configuration.',
    reasoning: 'The database connection pool is exhausted (98% utilization) causing HTTP 500 errors. Historical incident INC-1842 showed similar patterns. Restarting API instances will reset connection pools and restore service.',
    aiConfidence: 94,
    assignedTo: 'Rajesh Kumar (DevOps Manager)',
    createdAt: '2024-09-01T14:06:00Z',
    evidence: [
      'Database connection pool at 98% utilization',
      'Connection timeout errors in application logs',
      'HTTP 500 error rate at 18.4%',
      'Historical incident INC-1842 matched (similar pattern)',
      'CPU usage at 92%, Memory at 89%',
    ],
    affectedServices: ['Staging API', 'Order Service', 'Auth Service'],
  },
  {
    id: '2',
    incidentId: 'INC-2050',
    incident: mockIncidents[3],
    riskLevel: 'HIGH',
    status: 'PENDING',
    recommendedAction: 'Roll back Payment Service to v2.3.9 and increase pod memory limits to 1024Mi.',
    reasoning: 'Memory leak detected in v2.4.1 causing OOMKilled events. Rolling back to previous stable version while the team investigates the leak.',
    aiConfidence: 88,
    assignedTo: 'Deepak Hegde (DevOps Lead)',
    createdAt: '2024-09-01T14:20:00Z',
    evidence: [
      'OOMKilled events in pod logs',
      'Memory usage steadily increasing to container limit',
      'Issue introduced in deployment v2.4.1',
      'No similar issue in v2.3.9',
    ],
    affectedServices: ['Payment Service', 'Checkout Service'],
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'We are getting elevated HTTP 500 errors on our staging API gateway. Can you investigate what is failing?',
    timestamp: '14:02',
  },
  {
    id: '2',
    role: 'system',
    content: 'Language detected: English (en-US) 🌐',
    timestamp: '14:02',
    metadata: { language: 'en', stepType: 'language_detection' },
  },
  {
    id: '3',
    role: 'ai',
    content: 'Hello! I am immediately initiating an autonomous investigation into the staging API gateway anomaly.\n\n**Incident Initialized:**\n- **Incident:** INC-2048\n- **Issue:** HTTP 500 API Errors\n- **Environment:** Staging\n- **Service:** API Gateway\n- **Severity:** HIGH\n\nI am now analyzing live logs, telemetry metrics, and querying the knowledge base runbooks...',
    timestamp: '14:02',
    metadata: { language: 'en', toolsUsed: ['classifyIncident'], stepType: 'classification' },
  },
  {
    id: '4',
    role: 'ai',
    content: '**🔍 Telemetry Investigation Complete**\n\nI have correlated the following real-time signals:\n- ✅ Analyzed 127 log entries from STAGING-API-01\n- ✅ Correlated system telemetry metrics\n- ✅ Retrieved Database Connection Pool SOP Runbook\n- ✅ Pattern-matched against historical incident INC-1842 (91% correlation)\n\n**📊 System Metrics:**\n| Metric | Value | Status |\n|--------|-------|--------|\n| CPU Usage | 92% | 🔴 Critical |\n| Memory Usage | 89% | 🔴 Critical |\n| DB Connections | 98% | 🔴 Critical |\n| HTTP 500 Rate | 18.4% | 🔴 Critical |\n| Response Time | 4.8s | 🔴 Critical |',
    timestamp: '14:04',
    metadata: { toolsUsed: ['getIncidentLogs', 'getSystemMetrics', 'searchKnowledgeBase', 'getHistoricalIncidents'], stepType: 'investigation' },
  },
  {
    id: '5',
    role: 'ai',
    content: '**🎯 Root Cause Diagnosed**\n\n**Root Cause:** PostgreSQL database connection pool exhaustion (512/512 active connections saturated).\n**Confidence:** 94%\n\n**Key Evidence:**\n- ✓ Database connection saturation (98% on PROD-DB-01)\n- ✓ Connection timeout errors identified in API gateway logs\n- ✓ HTTP 500 spike directly correlated with DB pool wait queue\n- ✓ Historical incident INC-1842 pattern matched\n\n**📋 Recommended Remediation Plan:**\n1. Verify active connection leaks via `pg_stat_activity`\n2. Inspect connection pooler max limits (`max_connections: 512`)\n3. Execute zero-downtime rollout restart on API gateway pods\n\n⚠️ **Risk Tier: HIGH** — Human authorization required per SOC2 CC6.6 safety policy.',
    timestamp: '14:05',
    metadata: { toolsUsed: ['analyzeIncident', 'generateRemediationPlan', 'calculateRisk'], stepType: 'diagnosis' },
  },
  {
    id: '6',
    role: 'system',
    content: '⚠️ HUMAN APPROVAL REQUIRED — Escalated to DevOps Manager (Rajesh Kumar)',
    timestamp: '14:06',
    metadata: { stepType: 'escalation' },
  },
];

// ── Server data ──
export const mockServers = [
  { name: 'PROD-API-01', type: 'API Server', status: 'healthy', cpu: 45, memory: 62 },
  { name: 'PROD-API-02', type: 'API Server', status: 'healthy', cpu: 38, memory: 55 },
  { name: 'STAGING-API-01', type: 'API Server', status: 'degraded', cpu: 92, memory: 89 },
  { name: 'PROD-DB-01', type: 'Database', status: 'warning', cpu: 71, memory: 78 },
  { name: 'REDIS-01', type: 'Cache', status: 'healthy', cpu: 22, memory: 45 },
];

// ── Dashboard stats ──
export const dashboardStats = {
  systemHealth: 92,
  activeIncidents: 3,
  criticalIncidents: 1,
  pendingApprovals: 2,
  resolvedToday: 5,
  aiResolutionsToday: 17,
  avgResponseTime: '4.2 min',
  mttr: '23 min',
};
