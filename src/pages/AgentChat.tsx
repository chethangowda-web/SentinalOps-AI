import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, CheckCircle2, AlertTriangle, Globe, Volume2, Square } from 'lucide-react'
import { mockChatMessages, type ChatMessage, type Language } from '../data/mockData'
import { api } from '../utils/api'

interface AgentChatProps {
  language: Language
}

export default function AgentChat({ language }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const speakText = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    // Clean markdown stars/brackets for clean speech
    const cleanText = text.replace(/[*#`_]/g, '').replace(/\|.*?\|/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes('en') || v.lang.includes('kn'));
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingId(id);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const getPlaceholder = () => {
    if (language === 'kn') return 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...'
    if (language === 'hi') return 'अपनी समस्या यहाँ टाइप करें...'
    return 'Describe the incident or ask a question...'
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userText = input.trim()
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await api.postChat(userText, language)
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.content,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        metadata: {
          language: response.language,
          toolsUsed: response.toolsUsed || ['detectLanguage', 'searchKnowledgeBase', 'getIncidentLogs'],
        },
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err: any) {
      console.error('Chat error:', err)
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: '⚠️ Failed to get AI response: ' + (err.message || 'Server error'),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-container" style={{ height: 'calc(100vh - 130px)' }}>
      {/* Chat header */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--sentinel-cyan), var(--sentinel-blue))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>SentinelOps AI Agent Console</div>
            <div style={{ fontSize: 11, color: 'var(--sentinel-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div className="status-dot" style={{ width: 6, height: 6 }} /> Online — Ready to investigate
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <Globe size={14} />
          {language === 'kn' ? 'ಕನ್ನಡ' : language === 'hi' ? 'हिंदी' : 'English'}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.role === 'user' ? 'user' : ''}`}>
            {msg.role !== 'system' && (
              <div className={`chat-avatar ${msg.role === 'ai' ? 'ai' : 'human'}`}>
                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
              </div>
            )}
            <div>
              {msg.role === 'system' ? (
                <div style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 8, padding: '8px 14px', fontSize: 12.5, fontWeight: 600,
                  color: 'var(--sentinel-amber)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {msg.content.includes('Language') ? <Globe size={14} /> : <AlertTriangle size={14} />}
                  {msg.content}
                </div>
              ) : (
                  <div className="chat-bubble">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {msg.timestamp}
                      {msg.metadata?.toolsUsed && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--sentinel-cyan)', opacity: 0.7 }}>
                          [{msg.metadata.toolsUsed.join(', ')}]
                        </span>
                      )}
                    </div>
                    {msg.role === 'ai' && (
                      <button
                        onClick={() => speakText(msg.id, msg.content)}
                        title={speakingId === msg.id ? "Stop voice" : "Listen with AI voice"}
                        style={{
                          background: speakingId === msg.id ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 4,
                          color: speakingId === msg.id ? 'var(--sentinel-cyan)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 9,
                        }}
                      >
                        {speakingId === msg.id ? <Square size={10} /> : <Volume2 size={10} />}
                        {speakingId === msg.id ? 'STOP' : 'LISTEN'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message">
            <div className="chat-avatar ai">
              <Bot size={16} />
            </div>
            <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sentinel-cyan)' }}>
              <div className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} />
              Agent investigating... executing `detectLanguage()`, `searchKnowledgeBase()`
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ padding: '6px 16px', display: 'flex', gap: 6, overflowX: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid var(--border-sre)' }}>
        <button 
          onClick={() => setInput('ನಮ್ಮ staging API ನಲ್ಲಿ 500 error ಬರುತ್ತಿದೆ. ಏನು ಸಮಸ್ಯೆ?')}
          style={{ padding: '3px 8px', borderRadius: 12, border: '1px solid rgba(6, 182, 212, 0.3)', background: 'rgba(6, 182, 212, 0.08)', color: 'var(--sentinel-cyan)', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ⚡ Kannada API Query (ನಮ್ಮ staging API 500 error)
        </button>
        <button 
          onClick={() => setInput('Check database connection pool utilization on PROD-DB-01')}
          style={{ padding: '3px 8px', borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.08)', color: '#38bdf8', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🔍 DB Connection Pool Status
        </button>
        <button 
          onClick={() => setInput('Analyze Redis cache latency spikes for INC-2049')}
          style={{ padding: '3px 8px', borderRadius: 12, border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.08)', color: '#fbbf24', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ⚡ Redis Latency Investigation
        </button>
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={getPlaceholder()}
          disabled={loading}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={loading}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
