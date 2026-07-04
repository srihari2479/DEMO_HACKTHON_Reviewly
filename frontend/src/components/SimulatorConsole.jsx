import React from 'react';
import { X, RefreshCw, GitPullRequest } from 'lucide-react';

export default function SimulatorConsole({
  isSimulatorOpen,
  setIsSimulatorOpen,
  isSimulating,
  triggerSimulation,
  simLogs,
  repos = [],
  selectedRepo,
  setSelectedRepo
}) {
  if (!isSimulatorOpen) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="dev-sandbox-banner" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="dev-text" style={{ fontSize: '14px' }}>
            🛠️ <strong>Live PR Audit Console:</strong> Trigger a real-time scan to identify and audit any new, un-reviewed Pull Requests in your repository.
          </span>
          <button className="icon-button" onClick={() => setIsSimulatorOpen(false)} style={{ color: 'var(--primary-teal)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          {/* Repository selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '250px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>CHOOSE REPOSITORY</span>
            <select 
              value={selectedRepo} 
              onChange={(e) => setSelectedRepo(e.target.value)}
              style={{
                background: '#0b0f19',
                border: '1px solid var(--panel-border)',
                color: '#f8fafc',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              {repos.length > 0 ? (
                repos.map(r => (
                  <option key={r.id} value={r.fullName}>{r.fullName}</option>
                ))
              ) : (
                <option value="srihari2479/DEMO_HACKTHON_Reviewly">srihari2479/DEMO_HACKTHON_Reviewly</option>
              )}
            </select>
          </div>

          {/* Trigger button */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', minWidth: '200px' }}>
            <button 
              className="btn-sandbox" 
              onClick={triggerSimulation} 
              disabled={isSimulating}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '38px',
                padding: '0 24px',
                width: '100%'
              }}
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Scanning & Auditing...
                </>
              ) : (
                <>
                  <GitPullRequest size={14} /> Run Live Audit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {simLogs.length > 0 && (
        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.4)', borderStyle: 'dashed' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-teal)', display: 'block', marginBottom: '8px' }}>
            Console Live Logging:
          </span>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {simLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
