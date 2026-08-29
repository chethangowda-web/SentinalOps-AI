import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { searchKnowledgeBase, runGoldenPathAgent, detectLanguage } from './services/agent';
import { llm } from './services/llm';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SentinelOps AI Backend API',
    version: '1.0.0',
    endpoints: [
      'GET  /api/incidents',
      'GET  /api/incidents/:id',
      'GET  /api/incidents/:id/logs',
      'GET  /api/incidents/:id/metrics',
      'GET  /api/knowledge/search?q=...',
      'GET  /api/approvals',
      'POST /api/approvals/:id/decision',
      'POST /api/agent/trigger',
      'GET  /api/reports/:incidentId',
      'GET  /api/agent/audit/:incidentId',
      'POST /api/demo/reset'
    ]
  });
});

// List Incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        assignedTo: {
          select: { name: true, role: true }
        }
      },
      orderBy: { incidentId: 'desc' }
    });
    
    // Format to match frontend structure
    const formatted = incidents.map(inc => ({
      ...inc,
      assignedTo: inc.assignedTo ? inc.assignedTo.name : 'Unassigned',
      tags: inc.tags.split(',')
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve incidents' });
  }
});

// Single Incident Detail
app.get('/api/incidents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const incident = await prisma.incident.findFirst({
      where: {
        OR: [
          { id: id },
          { incidentId: id }
        ]
      },
      include: {
        assignedTo: true,
        logs: true,
        metrics: true
      }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const formatted = {
      ...incident,
      assignedTo: incident.assignedTo ? incident.assignedTo.name : 'Unassigned',
      tags: incident.tags.split(',')
    };

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve incident details' });
  }
});

// Get logs for an incident
app.get('/api/incidents/:id/logs', async (req, res) => {
  const { id } = req.params;
  try {
    const incident = await prisma.incident.findFirst({
      where: {
        OR: [
          { id: id },
          { incidentId: id }
        ]
      }
    });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const logs = await prisma.incidentLog.findMany({
      where: { incidentId: incident.id }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

// Get metrics for an incident
app.get('/api/incidents/:id/metrics', async (req, res) => {
  const { id } = req.params;
  try {
    const incident = await prisma.incident.findFirst({
      where: {
        OR: [
          { id: id },
          { incidentId: id }
        ]
      }
    });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const metrics = await prisma.systemMetric.findMany({
      where: { incidentId: incident.id }
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Knowledge Base Search (RAG)
app.get('/api/knowledge/search', async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    const docs = await prisma.knowledgeDocument.findMany();
    return res.json(docs);
  }
  
  try {
    const searchResults = await searchKnowledgeBase(q);
    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});

// Get approvals
app.get('/api/approvals', async (req, res) => {
  try {
    const approvals = await prisma.approval.findMany({
      include: {
        incident: true,
        assignedTo: true
      }
    });
    
    const formatted = approvals.map(appr => ({
      ...appr,
      evidence: JSON.parse(appr.evidence),
      affectedServices: appr.affectedServices.split(','),
      assignedTo: appr.assignedTo ? appr.assignedTo.name : 'DevOps Team'
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve approvals' });
  }
});

// Handle approval decision (APPROVE / REJECT)
app.post('/api/approvals/:id/decision', async (req, res) => {
  const { id } = req.params;
  const { decision, userEmail } = req.body; // APPROVED or REJECTED

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision' });
  }

  try {
    const approval = await prisma.approval.findUnique({
      where: { id: id },
      include: { incident: true }
    });

    if (!approval) return res.status(404).json({ error: 'Approval request not found' });

    // Update approval status
    const updatedApproval = await prisma.approval.update({
      where: { id: id },
      data: { status: decision }
    });

    // Update incident status
    const nextStatus = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    await prisma.incident.update({
      where: { id: approval.incidentId },
      data: { status: nextStatus }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        incidentId: approval.incidentId,
        action: 'HUMAN_APPROVAL',
        detail: `Remediation action is ${decision.toLowerCase()} by DevOps Manager. Status updated to ${nextStatus}.`,
        userEmail: userEmail || 'devops.manager@sentinelops.ai'
      }
    });

    // If approved, simulate execution background steps
    if (decision === 'APPROVED') {
      setTimeout(async () => {
        try {
          await prisma.incident.update({
            where: { id: approval.incidentId },
            data: { status: 'RESOLVED' }
          });
          
          await prisma.auditLog.create({
            data: {
              incidentId: approval.incidentId,
              action: 'REMEDIATION_EXECUTION',
              detail: 'API instances restarted successfully. Database connection pool returned to baseline limits. Incident resolved.'
            }
          });
        } catch (e) {
          console.error('Failed to run simulated remediation execution', e);
        }
      }, 5000); // 5s latency simulation
    }

    res.json({
      ...updatedApproval,
      evidence: JSON.parse(updatedApproval.evidence),
      affectedServices: updatedApproval.affectedServices.split(',')
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update approval decision' });
  }
});

// Trigger Agent Workflow for Incident INC-2048 (golden path)
app.post('/api/agent/trigger', async (req, res) => {
  const { incidentId, language } = req.body;
  const lang = language || 'en';
  
  try {
    const inc = await prisma.incident.findFirst({
      where: {
        OR: [
          { id: incidentId },
          { incidentId: incidentId }
        ]
      }
    });
    
    if (!inc) return res.status(404).json({ error: 'Incident not found' });
    
    const result = await runGoldenPathAgent(inc.id, lang as 'en' | 'kn' | 'hi');
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to execute agent workflow' });
  }
});

// Get generated incident report
app.get('/api/reports/:incidentId', async (req, res) => {
  const { incidentId } = req.params;
  try {
    const incident = await prisma.incident.findFirst({
      where: {
        OR: [
          { id: incidentId },
          { incidentId: incidentId }
        ]
      }
    });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const report = await prisma.incidentReport.findFirst({
      where: { incidentId: incident.id },
      orderBy: { generatedAt: 'desc' }
    });

    if (!report) return res.status(404).json({ error: 'Report not yet generated' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve report' });
  }
});

// Get AI activities / step timeline
app.get('/api/agent/audit/:incidentId', async (req, res) => {
  const { incidentId } = req.params;
  try {
    const incident = await prisma.incident.findFirst({
      where: {
        OR: [
          { id: incidentId },
          { incidentId: incidentId }
        ]
      }
    });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const auditLogs = await prisma.auditLog.findMany({
      where: { incidentId: incident.id },
      orderBy: { timestamp: 'asc' }
    });
    res.json(auditLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// Reset Demo Incident INC-2048 to initial state
app.post('/api/demo/reset', async (req, res) => {
  try {
    const inc = await prisma.incident.findUnique({
      where: { incidentId: 'INC-2048' }
    });

    if (inc) {
      await prisma.auditLog.deleteMany({ where: { incidentId: inc.id } });
      await prisma.incidentReport.deleteMany({ where: { incidentId: inc.id } });
      await prisma.approval.deleteMany({ where: { incidentId: inc.id } });
      
      await prisma.incident.update({
        where: { id: inc.id },
        data: {
          status: 'NEW',
          rootCause: null,
          confidence: null
        }
      });
    }

    res.json({ message: 'INC-2048 successfully reset to NEW' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset demo incident' });
  }
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, language } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const lang = detectLanguage(message) || language || 'en';
    const docs = await searchKnowledgeBase(message);
    const topDoc = docs[0];

    const systemInstruction = `You are SentinelOps AI, an enterprise IT operations assistant.
Answer the user's infrastructure question concisely in their language (${lang}).
Language rules:
- If language is 'kn', respond in clear Kannada.
- If language is 'hi', respond in clear Hindi.
- If language is 'en', respond in clear English.
Keep technical identifiers like HTTP 500, PostgreSQL, Kubernetes, Redis, CPU, and API accurate.
Context from runbooks:
${topDoc ? `[Runbook Match: ${topDoc.title}]: ${topDoc.content}` : 'No matching runbooks.'}`;

    const rawResponse = await llm.chat(message, systemInstruction);
    
    // Parse if JSON or use string directly
    let replyText = rawResponse;
    try {
      const parsed = JSON.parse(rawResponse);
      replyText = parsed.explanation || parsed.content || rawResponse;
    } catch {
      replyText = rawResponse;
    }

    res.json({
      role: 'ai',
      content: replyText,
      language: lang,
      toolsUsed: ['detectLanguage', 'searchKnowledgeBase', 'getIncidentLogs', 'getSystemMetrics'],
      knowledgeMatch: topDoc ? { title: topDoc.title, relevance: topDoc.relevance } : null
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Serve frontend static files in production
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      status: 'ok',
      service: 'SentinelOps AI Backend API',
      version: '1.0.0',
      message: 'Frontend bundle not found at dist path. API endpoints are ready.',
      endpoints: ['/api', '/api/incidents', '/api/approvals']
    });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 SentinelOps AI Backend is running on http://localhost:${PORT}`);
});
