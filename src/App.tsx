import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  Shield,
  FileText,
  Activity,
  Play,
  Zap,
  Globe,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import IncidentList from './pages/IncidentList'
import IncidentDetail from './pages/IncidentDetail'
import AgentChat from './pages/AgentChat'
import KnowledgeBase from './pages/KnowledgeBase'
import ApprovalCenter from './pages/ApprovalCenter'
import IncidentReport from './pages/IncidentReport'
import BlastRadiusPage from './pages/BlastRadiusPage'
import type { Language } from './data/mockData'
import { api } from './utils/api'

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [demoLoading, setDemoLoading] = useState(false)
  const [activeIncidentsCount, setActiveIncidentsCount] = useState(0)
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
  const [is2048Resolved, setIs2048Resolved] = useState(false)
  const [revenueLost, setRevenueLost] = useState(1280.00)
  const location = useLocation()
  const navigate = useNavigate()

  // Dodo Payments live revenue lost ticker
  useEffect(() => {
    if (is2048Resolved) return;
    const ticker = setInterval(() => {
      setRevenueLost(prev => prev + 15.00);
    }, 1000);
    return () => clearInterval(ticker);
  }, [is2048Resolved]);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const incs = await api.getIncidents();
        const active = incs.filter((i: any) => i.status !== 'RESOLVED').length;
        setActiveIncidentsCount(active);

        const apprs = await api.getApprovals();
        const pending = apprs.filter((a: any) => a.status === 'PENDING').length;
        setPendingApprovalsCount(pending);

        // Language and resolution status synchronization during active run
        const active2048 = incs.find((i: any) => i.incidentId === 'INC-2048');
        if (active2048) {
          setIs2048Resolved(active2048.status === 'RESOLVED');
        }
      } catch (err) {
        console.error('Failed to update sidebar counters:', err);
      }
    }
    
    fetchCounts();
    // Poll counters every 4 seconds
    const interval = setInterval(fetchCounts, 4000);
    return () => clearInterval(interval);
  }, []);

  const renderBreadcrumbs = () => {
    const path = location.pathname
    const baseStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }
    const activeStyle = { color: '#fff', fontWeight: 500 }
    const separator = <span style={{ color: 'var(--text-muted)', margin: '0 2px' }}>/</span>

    if (path === '/') {
      return (
        <div style={baseStyle}>
          <span style={activeStyle}>Dashboard</span>
        </div>
      )
    }
    if (path === '/incidents') {
      return (
        <div style={baseStyle}>
          <span>Incidents</span>
          {separator}
          <span style={activeStyle}>All Monitors</span>
        </div>
      )
    }
    if (path.startsWith('/incidents/')) {
      const id = path.split('/')[2]
      return (
        <div style={baseStyle}>
          <span>Incidents</span>
          {separator}
          <span>{id}</span>
          {separator}
          <span style={activeStyle}>Investigation Workspace</span>
        </div>
      )
    }
    if (path === '/chat') {
      return (
        <div style={baseStyle}>
          <span>Intelligence</span>
          {separator}
          <span style={activeStyle}>AI Agent Console</span>
        </div>
      )
    }
    if (path === '/knowledge') {
      return (
        <div style={baseStyle}>
          <span>Intelligence</span>
          {separator}
          <span style={activeStyle}>RAG Runbooks</span>
        </div>
      )
    }
    if (path === '/approvals') {
      return (
        <div style={baseStyle}>
          <span>Operations</span>
          {separator}
          <span style={activeStyle}>Approval Center</span>
        </div>
      )
    }
    if (path === '/blast-radius') {
      return (
        <div style={baseStyle}>
          <span>Operations</span>
          {separator}
          <span style={activeStyle}>Blast Radius Map</span>
        </div>
      )
    }
    if (path.startsWith('/reports/')) {
      const id = path.split('/')[2]
      return (
        <div style={baseStyle}>
          <span>Incidents</span>
          {separator}
          <span>{id}</span>
          {separator}
          <span style={activeStyle}>Incident Report</span>
        </div>
      )
    }
    return <div style={baseStyle}><span style={activeStyle}>SentinelOps AI</span></div>
  }

  const handleLaunchDemo = async () => {
    try {
      setDemoLoading(true)
      // If currently viewing an incident (e.g. /incidents/INC-2050 or /incidents/INC-2049), trigger on that incident
      let targetIncidentId = 'INC-2048';
      if (location.pathname.startsWith('/incidents/')) {
        const routeId = location.pathname.split('/')[2];
        if (routeId) targetIncidentId = routeId;
      } else {
        const incidents = await api.getIncidents().catch(() => []);
        const targetInc = incidents.find((i: any) => i.status !== 'RESOLVED') || incidents[0];
        if (targetInc) targetIncidentId = targetInc.incidentId || targetInc.id;
      }

      // Trigger the autonomous agent workflow on the selected incident
      await api.triggerAgent(targetIncidentId, language);
      
      // Navigate to the target incident investigation view
      navigate(`/incidents/${targetIncidentId}`);
    } catch (error) {
      console.error('Demo initiation failed:', error);
      alert('Failed to initiate agent flow: ' + error);
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--sentinel-cyan), var(--sentinel-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(6, 182, 212, 0.4)',
            flexShrink: 0
          }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.3px', fontSize: 13, fontWeight: 700 }}>SENTINELOPS AI</h1>
            <p style={{ fontSize: 9, color: 'var(--sentinel-cyan)', opacity: 0.85, fontWeight: 600 }}>OBSERVABILITY AGENT</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Overview</div>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={14} />
            Dashboard
          </NavLink>

          <div className="nav-section-label">Operations</div>
          <NavLink to="/incidents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <AlertTriangle size={14} />
            Incidents
            {activeIncidentsCount > 0 && (
              <span className="nav-badge">{activeIncidentsCount}</span>
            )}
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MessageSquare size={14} />
            AI Agent
          </NavLink>
          <NavLink to="/approvals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={14} />
            Approvals
            {pendingApprovalsCount > 0 && (
              <span className="nav-badge amber">{pendingApprovalsCount}</span>
            )}
          </NavLink>
          <NavLink to="/blast-radius" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={14} />
            Blast Radius
          </NavLink>

          <div className="nav-section-label">Intelligence</div>
          <NavLink to="/knowledge" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BookOpen size={14} />
            Runbooks
          </NavLink>
          <NavLink to="/reports/INC-2048" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={14} />
            Reports
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-dot" />
            <span>SYS_OK | Connected</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Top header */}
        <header className="top-header">
          <div className="header-left">
            {renderBreadcrumbs()}
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Dodo Payments Ticker */}
            <div className={`revenue-ticker ${is2048Resolved ? 'resolved-ticker' : ''}`}>
              <Zap size={11} fill={is2048Resolved ? '#10b981' : '#ef4444'} />
              {is2048Resolved ? (
                <span>Downtime Bleed: ${revenueLost.toFixed(2)} (Ledger Logged)</span>
              ) : (
                <span>Est. Revenue Lost: ${revenueLost.toFixed(2)} ($15.00/s)</span>
              )}
            </div>

            {/* Language selector */}
            <div className="language-selector">
              <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
              <button className={`lang-btn ${language === 'kn' ? 'active' : ''}`} onClick={() => setLanguage('kn')}>KN</button>
              <button className={`lang-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => setLanguage('hi')}>HI</button>
            </div>

            {/* Demo button */}
            <button className="demo-btn" onClick={handleLaunchDemo} disabled={demoLoading}>
              {demoLoading ? (
                <>
                  <span className="skeleton" style={{ width: 10, height: 10, display: 'inline-block', borderRadius: '50%' }} />
                  RUNNING_AGENT
                </>
              ) : (
                <>
                  <Play size={11} />
                  TRIGGER_FLOW
                </>
              )}
            </button>
          </div>
        </header>

        {/* Route content */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents" element={<IncidentList />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/chat" element={<AgentChat language={language} />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/approvals" element={<ApprovalCenter />} />
            <Route path="/blast-radius" element={<BlastRadiusPage />} />
            <Route path="/reports/:incidentId" element={<IncidentReport />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
