import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase(customPrisma?: PrismaClient) {
  const p = customPrisma || prisma;
  console.log('Clearing database...');
  await p.auditLog.deleteMany();
  await p.incidentReport.deleteMany();
  await p.approval.deleteMany();
  await p.systemMetric.deleteMany();
  await p.incidentLog.deleteMany();
  await p.incident.deleteMany();
  await p.knowledgeDocument.deleteMany();
  await p.historicalIncident.deleteMany();
  await p.user.deleteMany();

  console.log('Seeding Users...');
  const rajesh = await p.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@sentinelops.ai',
      role: 'DEVOPS',
    },
  });

  const priya = await p.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya.sharma@sentinelops.ai',
      role: 'DEVOPS',
    },
  });

  const arun = await p.user.create({
    data: {
      name: 'Arun Patel',
      email: 'arun.patel@sentinelops.ai',
      role: 'ENGINEER',
    },
  });

  const deepak = await p.user.create({
    data: {
      name: 'Deepak Hegde',
      email: 'deepak.hegde@sentinelops.ai',
      role: 'DEVOPS',
    },
  });

  console.log('Seeding Knowledge Base...');
  await p.knowledgeDocument.createMany({
    data: [
      {
        title: 'Database Connection Pool Runbook',
        category: 'Runbook',
        content: 'This runbook covers procedures for diagnosing and resolving database connection pool issues. Key steps include: 1) Check active connections using pg_stat_activity. 2) Identify long-running queries. 3) Verify pool configuration (max_connections, idle_timeout). 4) Monitor connection churn rate. 5) Restart affected services if pool is unrecoverable. For staging microservices, connection pools are capped at 50 connections.',
        relevance: 94,
        createdAt: '2024-06-15',
      },
      {
        title: 'Incident INC-1842 Post-Mortem',
        category: 'Post-Mortem',
        content: 'Root cause: Database connection pool exhaustion due to unclosed connections in the order processing microservice. Resolution: Updated connection pool max_idle_time from 300s to 60s, added connection leak detection, deployed hotfix v1.8.3. Time to resolution: 47 minutes.',
        relevance: 91,
        createdAt: '2024-07-22',
      },
      {
        title: 'Production Change Management Policy',
        category: 'Policy',
        content: 'All production changes require: 1) Approved change request ticket. 2) Risk assessment (Low/Medium/High). 3) Rollback plan. 4) DevOps manager approval for High-risk changes. 5) Maintenance window for infrastructure modifications. 6) Post-change verification checklist.',
        relevance: 87,
        createdAt: '2024-03-10',
      },
      {
        title: 'HTTP 500 Troubleshooting Guide',
        category: 'Guide',
        content: 'Step-by-step troubleshooting for HTTP 500 errors: 1) Check application logs for stack traces. 2) Verify database connectivity. 3) Check external service dependencies. 4) Review recent deployments. 5) Monitor system resources (CPU, memory, disk). 6) Check connection pool health. 7) Verify configuration files.',
        relevance: 89,
        createdAt: '2024-04-20',
      },
      {
        title: 'Staging Infrastructure Architecture',
        category: 'Documentation',
        content: 'Staging environment mirrors production with reduced capacity. Components: 2x API servers (STAGING-API-01, STAGING-API-02), 1x PostgreSQL primary (STAGING-DB-01), 1x Redis cache (STAGING-REDIS-01), Nginx load balancer. Database: PostgreSQL 15, max_connections=100, connection pool max=50.',
        relevance: 82,
        createdAt: '2024-05-05',
      },
      {
        title: 'API Gateway Troubleshooting Guide',
        category: 'Guide',
        content: 'Common API Gateway issues: 1) Rate limiting - check X-RateLimit headers. 2) Authentication failures - verify JWT token configuration. 3) Timeout errors - increase upstream timeout settings. 4) 502/503 errors - check backend service health. 5) SSL/TLS issues - verify certificate chain.',
        relevance: 76,
        createdAt: '2024-02-28',
      },
      {
        title: 'DevOps Escalation Policy',
        category: 'Policy',
        content: 'Escalation matrix: P1 (Critical) - Immediate page to on-call + DevOps Manager, 15min response SLA. P2 (High) - Page on-call engineer, 30min response SLA. P3 (Medium) - Slack notification to team channel, 2hr response SLA. P4 (Low) - Ticket creation, next business day response.',
        relevance: 84,
        createdAt: '2024-01-15',
      },
      {
        title: 'Database Recovery Procedures',
        category: 'Runbook',
        content: 'Emergency database recovery: 1) Identify failure type (connection, corruption, replication). 2) For connection issues: restart connection pooler, verify pg_bouncer. 3) For corruption: initiate point-in-time recovery from WAL. 4) For replication lag: check network, rebuild replica if necessary. 5) Always notify DBA team.',
        relevance: 79,
        createdAt: '2024-05-20',
      },
    ],
  });

  console.log('Seeding Historical Incidents...');
  await p.historicalIncident.createMany({
    data: [
      {
        incidentId: 'INC-1842',
        title: 'HTTP 500 Connection Timeout in Order Processing',
        rootCause: 'Database connection pool exhaustion',
        confidence: 91,
        createdAt: '2024-07-22',
      },
      {
        incidentId: 'INC-1980',
        title: 'Staging API Latency degradation',
        rootCause: 'Redis eviction policy configuration error',
        confidence: 85,
        createdAt: '2024-08-11',
      },
    ],
  });

  console.log('Seeding Initial Incidents...');
  const inc2048 = await p.incident.create({
    data: {
      incidentId: 'INC-2048',
      title: 'HTTP 500 API Failure',
      description: 'Staging API returning HTTP 500 errors on multiple endpoints. Affecting order processing and user authentication services.',
      service: 'Staging API',
      environment: 'Staging',
      severity: 'HIGH',
      status: 'NEW',
      confidence: null,
      rootCause: null,
      tags: 'api,database,staging',
      assignedToId: rajesh.id,
    },
  });

  await p.incidentLog.createMany({
    data: [
      { incidentId: inc2048.id, timestamp: '14:02:11', level: 'INFO', message: 'Request received GET /api/orders', source: 'STAGING-API-01' },
      { incidentId: inc2048.id, timestamp: '14:02:12', level: 'INFO', message: 'Authentication token validated', source: 'STAGING-API-01' },
      { incidentId: inc2048.id, timestamp: '14:02:13', level: 'WARN', message: 'Database connection pool utilization at 91%', source: 'PROD-DB-01' },
      { incidentId: inc2048.id, timestamp: '14:02:14', level: 'ERROR', message: 'Connection pool exhausted - cannot acquire connection', source: 'PROD-DB-01' },
      { incidentId: inc2048.id, timestamp: '14:02:14', level: 'ERROR', message: 'Database connection timeout after 30000ms', source: 'STAGING-API-01' },
      { incidentId: inc2048.id, timestamp: '14:02:15', level: 'ERROR', message: 'Failed to acquire database connection from pool', source: 'STAGING-API-01' },
      { incidentId: inc2048.id, timestamp: '14:02:15', level: 'ERROR', message: 'Unhandled exception in OrderController.getOrders()', source: 'STAGING-API-01' },
      { incidentId: inc2048.id, timestamp: '14:02:16', level: 'ERROR', message: 'HTTP 500 Internal Server Error - GET /api/orders', source: 'STAGING-API-01' },
      { incidentId: inc2048.id, timestamp: '14:02:18', level: 'WARN', message: 'Request queue depth increasing: 47 pending requests', source: 'STAGING-API-01' },
    ],
  });

  await p.systemMetric.createMany({
    data: [
      { incidentId: inc2048.id, metricName: 'CPU Usage', value: 92, unit: '%', status: 'danger' },
      { incidentId: inc2048.id, metricName: 'Memory Usage', value: 89, unit: '%', status: 'danger' },
      { incidentId: inc2048.id, metricName: 'Disk I/O', value: 67, unit: '%', status: 'warning' },
      { incidentId: inc2048.id, metricName: 'DB Connections', value: 98, unit: '%', status: 'danger' },
      { incidentId: inc2048.id, metricName: 'HTTP 500 Rate', value: 18.4, unit: '%', status: 'danger' },
      { incidentId: inc2048.id, metricName: 'Avg Response Time', value: 4.8, unit: 's', status: 'danger' },
    ],
  });

  const inc2049 = await p.incident.create({
    data: {
      incidentId: 'INC-2049',
      title: 'Redis Cache Latency Spike',
      description: 'Production Redis cluster experiencing intermittent latency spikes exceeding 200ms. Affecting session management.',
      service: 'Redis Cluster',
      environment: 'Production',
      severity: 'MEDIUM',
      status: 'INVESTIGATING',
      confidence: 78,
      rootCause: 'Memory fragmentation in Redis cluster',
      tags: 'redis,cache,latency',
      assignedToId: priya.id,
    },
  });

  const inc2047 = await p.incident.create({
    data: {
      incidentId: 'INC-2047',
      title: 'SSL Certificate Expiry Warning',
      description: 'SSL certificate for api.staging.internal expiring in 7 days. Requires renewal before Sept 8.',
      service: 'API Gateway',
      environment: 'Staging',
      severity: 'LOW',
      status: 'RESOLVED',
      confidence: 99,
      rootCause: 'Automated renewal failed due to DNS propagation delay',
      tags: 'ssl,certificate,security',
      assignedToId: arun.id,
    },
  });

  const inc2050 = await p.incident.create({
    data: {
      incidentId: 'INC-2050',
      title: 'Kubernetes Pod CrashLoopBackOff',
      description: 'Payment service pods in production entering CrashLoopBackOff state after latest deployment.',
      service: 'Payment Service',
      environment: 'Production',
      severity: 'CRITICAL',
      status: 'REMEDIATION_PENDING',
      confidence: 88,
      rootCause: 'Out-of-memory kill due to memory leak in v2.4.1',
      tags: 'kubernetes,payment,crash',
      assignedToId: deepak.id,
    },
  });

  await p.approval.create({
    data: {
      incidentId: inc2050.id,
      riskLevel: 'HIGH',
      status: 'PENDING',
      recommendedAction: 'Roll back Payment Service to v2.3.9 and increase pod memory limits to 1024Mi.',
      reasoning: 'Memory leak detected in v2.4.1 causing OOMKilled events. Rolling back to previous stable version while the team investigates the leak.',
      aiConfidence: 88,
      assignedToId: deepak.id,
      evidence: JSON.stringify([
        'OOMKilled events in pod logs',
        'Memory usage steadily increasing to container limit',
        'Issue introduced in deployment v2.4.1',
        'No similar issue in v2.3.9',
      ]),
      affectedServices: 'Payment Service,Checkout Service',
    },
  });

  console.log('Seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
