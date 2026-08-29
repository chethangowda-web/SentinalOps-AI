import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:3000';

async function runAllTests() {
  console.log('🧪 Starting SentinelOps AI Backend Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check Test
  await test('GET /api (Health Check)', async () => {
    const res = await fetch(`${BASE_URL}/api`);
    assert.strictEqual(res.status, 200);
    const data = await res.json() as any;
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'SentinelOps AI Backend API');
  });

  // 2. Root Health Check Test
  await test('GET / (Root Health Check)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const data = await res.json() as any;
    assert.strictEqual(data.status, 'ok');
  });

  // 3. Reset Demo Test
  await test('POST /api/demo/reset', async () => {
    const res = await fetch(`${BASE_URL}/api/demo/reset`, { method: 'POST' });
    assert.strictEqual(res.status, 200);
    const data = await res.json() as any;
    assert.strictEqual(data.message, 'INC-2048 successfully reset to NEW');
  });

  // 4. List Incidents Test
  await test('GET /api/incidents', async () => {
    const res = await fetch(`${BASE_URL}/api/incidents`);
    assert.strictEqual(res.status, 200);
    const data = await res.json() as any[];
    assert(Array.isArray(data));
    assert(data.length >= 4);
    const inc2048 = data.find(i => i.incidentId === 'INC-2048');
    assert(inc2048, 'INC-2048 should exist in incident list');
  });

  // 5. Get Single Incident Test
  await test('GET /api/incidents/INC-2048', async () => {
    const res = await fetch(`${BASE_URL}/api/incidents/INC-2048`);
    assert.strictEqual(res.status, 200);
    const data = await res.json() as any;
    assert.strictEqual(data.incidentId, 'INC-2048');
    assert.strictEqual(data.service, 'Staging API');
  });

  // 6. Get Logs Test
  await test('GET /api/incidents/INC-2048/logs', async () => {
    const res = await fetch(`${BASE_URL}/api/incidents/INC-2048/logs`);
    assert.strictEqual(res.status, 200);
    const logs = await res.json() as any[];
    assert(Array.isArray(logs));
    assert(logs.length > 0);
  });

  // 7. Get Metrics Test
  await test('GET /api/incidents/INC-2048/metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/incidents/INC-2048/metrics`);
    assert.strictEqual(res.status, 200);
    const metrics = await res.json() as any[];
    assert(Array.isArray(metrics));
    assert(metrics.length >= 4);
  });

  // 8. RAG Search Test
  await test('GET /api/knowledge/search?q=database pool', async () => {
    const res = await fetch(`${BASE_URL}/api/knowledge/search?q=database%20pool`);
    assert.strictEqual(res.status, 200);
    const docs = await res.json() as any[];
    assert(Array.isArray(docs));
    assert(docs.length > 0);
    assert(docs[0].relevance > 50);
  });

  // 9. Trigger Agent Orchestration Test
  let createdApprovalId = '';
  await test('POST /api/agent/trigger (Golden Path)', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId: 'INC-2048', language: 'kn' })
    });
    assert.strictEqual(res.status, 200);
    const result = await res.json() as any;
    assert.strictEqual(result.incidentId, 'INC-2048');
    assert.strictEqual(result.status, 'REMEDIATION_PENDING');
    assert(result.approvalId);
    createdApprovalId = result.approvalId;
  });

  // 10. Audit Logs Test
  await test('GET /api/agent/audit/INC-2048', async () => {
    const res = await fetch(`${BASE_URL}/api/agent/audit/INC-2048`);
    assert.strictEqual(res.status, 200);
    const auditLogs = await res.json() as any[];
    assert(Array.isArray(auditLogs));
    assert(auditLogs.length >= 5);
  });

  // 11. Get Generated Report Test
  await test('GET /api/reports/INC-2048', async () => {
    const res = await fetch(`${BASE_URL}/api/reports/INC-2048`);
    assert.strictEqual(res.status, 200);
    const report = await res.json() as any;
    assert(report.content.includes('INCIDENT REPORT'));
  });

  // 12. List Approvals Test
  await test('GET /api/approvals', async () => {
    const res = await fetch(`${BASE_URL}/api/approvals`);
    assert.strictEqual(res.status, 200);
    const approvals = await res.json() as any[];
    assert(Array.isArray(approvals));
    assert(approvals.length > 0);
  });

  // 13. Decision Action Test (Approve Remediation)
  await test('POST /api/approvals/:id/decision (APPROVE)', async () => {
    assert(createdApprovalId, 'Approval ID required');
    const res = await fetch(`${BASE_URL}/api/approvals/${createdApprovalId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'APPROVED' })
    });
    assert.strictEqual(res.status, 200);
    const updated = await res.json() as any;
    assert.strictEqual(updated.status, 'APPROVED');
  });

  // 14. Interactive AI Chat Test
  await test('POST /api/chat (Kannada Query)', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ನಮ್ಮ staging API ನಲ್ಲಿ 500 error ಬರುತ್ತಿದೆ' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json() as any;
    assert.strictEqual(data.role, 'ai');
    assert.strictEqual(data.language, 'kn');
    assert(Array.isArray(data.toolsUsed));
  });

  console.log(`\n📊 Test Results: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
