import React from 'react';
import { X, RefreshCw } from 'lucide-react';

export default function SimulatorConsole({
  isSimulatorOpen,
  setIsSimulatorOpen,
  isSimulating,
  triggerSimulation,
  simLogs
}) {
  if (!isSimulatorOpen) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="dev-sandbox-banner">
        <span className="dev-text">
          🛠️ <strong>Hackathon Simulator Portal:</strong> Trigger a mock webhook event to audit a new code commit live.
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isSimulating && <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--primary-teal)' }} />}
          <button className="btn-sandbox" onClick={triggerSimulation} disabled={isSimulating}>
            {isSimulating ? "Analyzing Diff..." : "Simulate PR Webhook"}
          </button>
          <button className="icon-button" onClick={() => setIsSimulatorOpen(false)} style={{ color: 'var(--primary-teal)' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {simLogs.length > 0 && (
        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.4)', borderStyle: 'dashed' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-teal)', display: 'block', marginBottom: '8px' }}>
            Simulation Console Outputs:
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
