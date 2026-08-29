const API_BASE = '/api';

export async function fetchApi(path: string, options?: RequestInit) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getIncidents: () => fetchApi('/incidents'),
  getIncident: (id: string) => fetchApi(`/incidents/${id}`),
  getLogs: (id: string) => fetchApi(`/incidents/${id}/logs`),
  getMetrics: (id: string) => fetchApi(`/incidents/${id}/metrics`),
  searchKnowledge: (query?: string) => fetchApi(`/knowledge/search?q=${encodeURIComponent(query || '')}`),
  getApprovals: () => fetchApi('/approvals'),
  postApprovalDecision: (id: string, decision: 'APPROVED' | 'REJECTED') => 
    fetchApi(`/approvals/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),
  triggerAgent: (incidentId: string, language: string) => 
    fetchApi('/agent/trigger', {
      method: 'POST',
      body: JSON.stringify({ incidentId, language }),
    }),
  postChat: (message: string, language: string) =>
    fetchApi('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language }),
    }),
  getReport: (incidentId: string) => fetchApi(`/reports/${incidentId}`),
  getAuditLogs: (incidentId: string) => fetchApi(`/agent/audit/${incidentId}`),
  resetDemo: () => fetchApi('/demo/reset', { method: 'POST' }),
};
