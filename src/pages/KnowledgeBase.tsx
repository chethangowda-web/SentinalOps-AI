import { useEffect, useState } from 'react'
import { Search, FileText, Tag, ExternalLink } from 'lucide-react'
import { api } from '../utils/api'

interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  relevance: number;
  createdAt: string;
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        const data = await api.searchKnowledge(searchQuery);
        setDocuments(data);
        if (data.length > 0 && !selectedDocId) {
          setSelectedDocId(data[0].id);
        }
      } catch (e) {
        console.error('Failed to query knowledge base:', e);
      } finally {
        setLoading(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      loadDocuments();
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const selected = documents.find(d => d.id === selectedDocId)
  const categories = Array.from(new Set(documents.map(d => d.category)))

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Enterprise Knowledge Base</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {documents.length} documents indexed for RAG retrieval by AI Agent
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search knowledge base — runbooks, guides, post-mortems, policies..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10,
            padding: '12px 16px 12px 42px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20 }}>All</button>
        {categories.map(cat => (
          <button key={cat} className="btn btn-secondary" style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20 }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedDocId ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Document list */}
        <div className="card animate-in" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="section-title">Documents ({documents.length})</div>
          </div>
          {loading ? (
            <div style={{ padding: 20 }}>
              <div className="skeleton" style={{ height: 60, width: '100%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 60, width: '100%' }} />
            </div>
          ) : documents.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No runbooks found</div>
          ) : (
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              {documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    background: selectedDocId === doc.id ? 'rgba(0,212,255,0.04)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (selectedDocId !== doc.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if (selectedDocId !== doc.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="kb-icon"><FileText size={18} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{doc.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {doc.content}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
                      <span className="badge low" style={{ fontSize: 9, padding: '2px 8px' }}>{doc.category}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doc.createdAt}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: doc.relevance > 88 ? 'var(--sentinel-green)' : 'var(--sentinel-amber)' }}>
                        Relevance: {doc.relevance}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document viewer */}
        {selected && (
          <div className="card animate-in" style={{ position: 'sticky', top: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span className="badge low" style={{ fontSize: 10, marginBottom: 8, display: 'inline-block' }}>{selected.category}</span>
                <h4 style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>{selected.title}</h4>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Created: {selected.createdAt} · Relevance: <span style={{ color: 'var(--sentinel-green)', fontWeight: 600 }}>{selected.relevance}%</span>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: '5px 10px' }}>
                <ExternalLink size={12} />
              </button>
            </div>
            <hr className="divider" />
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {selected.content}
            </div>
            <hr className="divider" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Used in: INC-2048 investigation · Retrieved by RAG with {selected.relevance}% relevance
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
