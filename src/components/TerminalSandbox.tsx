import { useState } from 'react';
import { Terminal, Play, FileCode } from 'lucide-react';

interface TerminalSandboxProps {
  incidentId?: string;
  service?: string;
  rootCause?: string;
  recommendedAction?: string;
}

export default function TerminalSandbox({
  incidentId = 'INC-2048',
  service = 'Staging API',
  rootCause = 'Database connection pool exhaustion',
  recommendedAction = 'Restart affected API gateway instances'
}: TerminalSandboxProps) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const isK8s = (service && service.includes('Payment')) || (rootCause && rootCause.toLowerCase().includes('memory leak'));
  const isRedis = (service && service.includes('Redis')) || (rootCause && rootCause.toLowerCase().includes('fragmentation'));

  const command = isK8s
    ? 'kubectl rollout undo deployment/payment-service -n production --dry-run=server'
    : isRedis
    ? 'redis-cli -h redis-cluster.internal config set activedefrag yes'
    : 'kubectl apply -f k8s/staging-api-patch.yaml --dry-run=server';

  // Dynamic YAML / Config Diff data matching the incident
  const renderConfigDiff = () => {
    if (isK8s) {
      return (
        <>
          <div style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 4, marginBottom: 4 }}>
            # diff payment-service-deployment.yaml
          </div>
          <div>apiVersion: apps/v1</div>
          <div>kind: Deployment</div>
          <div>metadata:</div>
          <div>  name: payment-service</div>
          <div>  namespace: production</div>
          <div>spec:</div>
          <div>  template:</div>
          <div>    spec:</div>
          <div>      containers:</div>
          <div>      - name: payment-service</div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>-       image: sentinelops/payment-service:v2.4.1</div>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#4ade80' }}>+       image: sentinelops/payment-service:v2.3.9</div>
          <div style={{ color: '#475569' }}>        # Pod Memory Limit expansion</div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>-       memory: "512Mi"</div>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#4ade80' }}>+       memory: "1024Mi"</div>
        </>
      );
    }

    if (isRedis) {
      return (
        <>
          <div style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 4, marginBottom: 4 }}>
            # diff redis-cluster-config.conf
          </div>
          <div># Redis Cluster Memory Management Policy</div>
          <div>cluster-enabled yes</div>
          <div>maxmemory 4gb</div>
          <div style={{ color: '#475569' }}># Eviction Policy Update</div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>- maxmemory-policy volatile-lru</div>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#4ade80' }}>+ maxmemory-policy allkeys-lru</div>
          <div style={{ color: '#475569' }}># Active Memory Defragmentation</div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>- activedefrag no</div>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#4ade80' }}>+ activedefrag yes</div>
          <div>active-defrag-ignore-bytes 100mb</div>
          <div>active-defrag-threshold-lower 10</div>
        </>
      );
    }

    return (
      <>
        <div style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 4, marginBottom: 4 }}>
          # diff staging-api-deployment.yaml
        </div>
        <div>apiVersion: apps/v1</div>
        <div>kind: Deployment</div>
        <div>metadata:</div>
        <div>  name: staging-api</div>
        <div>spec:</div>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>- replicas: 2</div>
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#4ade80' }}>+ replicas: 3</div>
        <div>  template:</div>
        <div>    spec:</div>
        <div>      containers:</div>
        <div>      - name: api-server</div>
        <div style={{ color: '#475569' }}>        # Resource allocation updates</div>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>-       cpu: "1000m"</div>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>-       memory: "512Mi"</div>
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#4ade80' }}>+       cpu: "2000m"</div>
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#4ade80' }}>+       memory: "1024Mi"</div>
        <div>        env:</div>
        <div style={{ color: '#475569' }}>        # Database pool scale updates</div>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>-       - name: DB_POOL_SIZE</div>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>-         value: "50"</div>
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#4ade80' }}>+       - name: DB_POOL_SIZE</div>
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#4ade80' }}>+         value: "150"</div>
      </>
    );
  };

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOutput([]);

    setTimeout(() => {
      setTerminalOutput(prev => [...prev, `$ ${command}`]);
    }, 300);

    setTimeout(() => {
      setTerminalOutput(prev => [...prev, `🔍 Connecting to ${service} infrastructure cluster context...`]);
    }, 1100);

    setTimeout(() => {
      setTerminalOutput(prev => [...prev, '🛡️ Validating target schema & rollback safety gates...']);
    }, 2200);

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        isK8s
          ? `deployment.apps/payment-service rollback target v2.3.9 confirmed (dry-run=server passed)`
          : isRedis
          ? `redis-cluster node 127.0.0.1:6379 activedefrag=yes syntax verified (dry-run passed)`
          : `deployment.apps/staging-api configured (dry-run=server passed)`
      ]);
    }, 3300);

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        '✅ CONFIGURATION IS SAFE: Dry-run execution succeeded. Ready for human authorization.'
      ]);
      setIsRunning(false);
    }, 4200);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, margin: 0 }}>
      {/* Visual terminal simulation window */}
      <div 
        className="card" 
        style={{
          border: '1px solid var(--border-sre)',
          background: '#020617',
          padding: 12,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 280,
          fontFamily: 'var(--font-mono)',
          fontSize: 11
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: 6, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
            <Terminal size={12} style={{ color: 'var(--sentinel-cyan)' }} />
            <span>CLI_DRY_RUN_SANDBOX</span>
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={runSimulation}
            disabled={isRunning}
            style={{ padding: '2px 8px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(6, 182, 212, 0.1)', color: 'var(--sentinel-cyan)', border: '1px solid rgba(6, 182, 212, 0.2)' }}
          >
            <Play size={10} /> {isRunning ? 'SIMULATING...' : 'TEST_DRY_RUN'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, color: '#38bdf8', padding: '4px 0' }}>
          {terminalOutput.length === 0 ? (
            <div style={{ color: '#64748b', fontStyle: 'italic' }}>
              Awaiting dry-run execution. Click 'TEST_DRY_RUN' above to validate the patch config.
            </div>
          ) : (
            terminalOutput.map((line, idx) => {
              const isCommand = line.startsWith('$');
              const isSuccess = line.startsWith('✅');
              const isInfo = line.startsWith('🔍') || line.startsWith('🛡️');
              let color = '#38bdf8';
              
              if (isCommand) color = 'var(--sentinel-green)';
              else if (isSuccess) color = 'var(--sentinel-green)';
              else if (isInfo) color = '#f59e0b';

              return (
                <div key={idx} style={{ color, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                  {line}
                </div>
              );
            })
          )}
          {isRunning && (
            <div style={{ color: 'var(--sentinel-cyan)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
              Executing dry-run on {service}...
            </div>
          )}
        </div>
      </div>

      {/* Code YAML / Config Diff view */}
      <div 
        className="card" 
        style={{
          border: '1px solid var(--border-sre)',
          background: 'var(--bg-panel)',
          padding: 12,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 280
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border-sre)', paddingBottom: 6, marginBottom: 8 }}>
          <FileCode size={12} style={{ color: 'var(--sentinel-cyan)' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>CONFIG SPEC LIVE PATCH DIFF</span>
        </div>

        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.2)',
            padding: 8,
            borderRadius: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            lineHeight: 1.45,
            color: 'var(--text-secondary)'
          }}
        >
          {renderConfigDiff()}
        </div>
      </div>
    </div>
  );
}
