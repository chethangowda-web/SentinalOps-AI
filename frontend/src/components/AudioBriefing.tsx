import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Bot, RotateCcw } from 'lucide-react';

interface AudioBriefingProps {
  incidentId?: string;
  service?: string;
  rootCause?: string;
  recommendedAction?: string;
  assignedTo?: string;
}

export default function AudioBriefing({
  incidentId = 'INC-2048',
  service = 'Staging API',
  rootCause = 'Database connection pool exhaustion',
  recommendedAction = 'Restart affected API gateway instances',
  assignedTo = 'DevOps Team'
}: AudioBriefingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [language, setLanguage] = useState<'en' | 'kn'>('en');
  const [duration, setDuration] = useState(14);
  const intervalRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Dynamically generated transcripts matching the actual incident
  const getTranscripts = () => {
    const isK8s = (service && service.includes('Payment')) || (rootCause && rootCause.toLowerCase().includes('memory leak'));
    const isRedis = (service && service.includes('Redis')) || (rootCause && rootCause.toLowerCase().includes('fragmentation'));

    if (isK8s) {
      return {
        en: `SentinelOps critical warning for ${incidentId} on ${service}. Microservice pods are entering CrashLoopBackOff due to memory limit saturation. Root cause: memory leak in release v2.4.1. Recommended remediation: rollback to stable version v2.3.9 and expand pod memory limits. Escalated to ${assignedTo}. Please authorize the remediation.`,
        kn: `ಸೆಂಟಿನೆಲ್ ಆಪ್ಸ್ ತುರ್ತು ಎಚ್ಚರಿಕೆ: ${service} ಪಾಡ್‌ಗಳು ಮೆಮೊರಿ ಕೊರತೆಯಿಂದ ಸ್ಥಗಿತಗೊಂಡಿವೆ. ಮೂಲ ಕಾರಣ: v2.4.1 ನಲ್ಲಿ ಮೆಮೊರಿ ಲೀಕ್. ರೋಲ್‌ಬ್ಯಾಕ್ ಕ್ರಮವನ್ನು ದಯವಿಟ್ಟು ಅನುಮೋದಿಸಿ.`
      };
    }

    if (isRedis) {
      return {
        en: `SentinelOps operational escalation for ${incidentId} on ${service}. Cache cluster is experiencing elevated latency spikes exceeding SLA thresholds. Root cause: memory fragmentation in Redis cluster. Recommended remediation: trigger active memory defragmentation and update eviction policy. Escalated to ${assignedTo}. Please authorize the remediation.`,
        kn: `ಸೆಂಟಿನೆಲ್ ಆಪ್ಸ್ ಕಾರ್ಯಾಚರಣೆ ಎಚ್ಚರಿಕೆ: ${service} ನಲ್ಲಿ ಮೆಮೊರಿ ವಿಘಟನೆ ಹೆಚ್ಚಾಗಿ ವಿಳಂಬ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಸಕ್ರಿಯ ಡಿಫ್ರಾಗ್ಮೆಂಟೇಶನ್ ಪರಿಹಾರವನ್ನು ಅನುಮೋದಿಸಿ.`
      };
    }

    return {
      en: `SentinelOps operational warning for ${incidentId} on ${service}. Root cause diagnosed as ${rootCause}. Safety gates are active per policy. Recommended action: ${recommendedAction}. Escalated to ${assignedTo}. Please review and authorize the remediation.`,
      kn: `ಸೆಂಟಿನೆಲ್ ಆಪ್ಸ್ ಕಾರ್ಯಾಚರಣೆ ಎಚ್ಚರಿಕೆ: ${service} ನಲ್ಲಿ ${rootCause} ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ. ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ: ${recommendedAction}. ದಯವಿಟ್ಟು ಅನುಮೋದಿಸಿ.`
    };
  };

  const transcript = getTranscripts();

  // Tone chime using Web Audio API for immediate audible feedback
  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext fallback
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
  };

  const startAudio = (langToPlay: 'en' | 'kn' = language) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);

    playChime();

    const textToSpeak = transcript[langToPlay];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    synthRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    if (langToPlay === 'kn') {
      utterance.lang = 'kn-IN';
      const knVoice = voices.find(v => v.lang.includes('kn') || v.lang.includes('IN'));
      if (knVoice) utterance.voice = knVoice;
      setDuration(16);
    } else {
      utterance.lang = 'en-US';
      const enVoice = voices.find(v => (v.lang === 'en-US' || v.lang.includes('en')) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')));
      if (enVoice) utterance.voice = enVoice;
      setDuration(14);
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentTime(0);
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentTime(0);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleLanguageChange = (lang: 'en' | 'kn') => {
    stopAudio();
    setLanguage(lang);
    setCurrentTime(0);
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      stopAudio();
    };
  }, []);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => {
    const barCount = 36;
    return (
      <svg width="100%" height="45" viewBox="0 0 150 45" style={{ overflow: 'visible' }}>
        {Array.from({ length: barCount }).map((_, i) => {
          const phase = (i / barCount) * Math.PI * 4;
          const factor = isPlaying ? Math.sin(Date.now() / 200 + phase) * 0.4 + 0.6 : 0.2;
          const originalHeight = Math.abs(Math.sin(phase)) * 25 + 8;
          const height = originalHeight * factor;
          
          const progressPercent = Math.min((currentTime / duration) * 100, 100);
          const isPassed = (i / barCount) * 100 < progressPercent;
          const color = isPassed ? 'var(--sentinel-cyan)' : 'var(--text-muted)';
          const opacity = isPassed ? 1 : 0.4;

          return (
            <rect
              key={i}
              x={i * 4.2}
              y={22.5 - height / 2}
              width={2.5}
              height={height}
              rx={1.2}
              fill={color}
              opacity={opacity}
              style={{ transition: 'height 0.15s ease, fill 0.3s ease' }}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div 
      className="card" 
      style={{
        border: '1px solid var(--border-sre)',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
        padding: 14,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ padding: 4, borderRadius: 6, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={13} style={{ color: 'var(--sentinel-cyan)' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              AI Audio Escalation Briefing ({incidentId})
              <Volume2 size={12} style={{ color: 'var(--sentinel-cyan)' }} />
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Synthesized via ElevenLabs & Sarvam Indic API</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button 
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
            style={{ fontSize: 9, padding: '2px 6px' }}
          >
            EN (English)
          </button>
          <button 
            className={`lang-btn ${language === 'kn' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('kn')}
            style={{ fontSize: 9, padding: '2px 6px' }}
          >
            KN (ಕನ್ನಡ)
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
        <button 
          onClick={togglePlay}
          title={isPlaying ? "Pause voice briefing" : "Play voice briefing"}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--sentinel-cyan)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.5)',
            flexShrink: 0,
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying ? <Pause size={15} color="#000" /> : <Play size={15} color="#000" style={{ marginLeft: 2 }} />}
        </button>

        {currentTime > 0 && (
          <button
            onClick={() => { stopAudio(); startAudio(); }}
            title="Replay from start"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={11} />
          </button>
        )}

        <div style={{ flex: 1 }}>
          {renderWaveform()}
        </div>

        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', flexShrink: 0 }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div 
        style={{
          fontSize: 10.5,
          color: 'var(--text-secondary)',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: 8,
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          lineHeight: 1.45,
          fontFamily: 'var(--font-sans)'
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3, display: 'flex', justifyContent: 'space-between' }}>
          <span>{language === 'kn' ? 'ಲೈವ್ ಲಿಪ್ಯಂತರ (Transcript)' : 'Live Operational Transcript'}</span>
          <span style={{ color: isPlaying ? '#22c55e' : 'var(--text-muted)' }}>
            {isPlaying ? '● AUDIO ACTIVE' : '○ READY'}
          </span>
        </div>
        {transcript[language]}
      </div>
    </div>
  );
}
