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
  setSelectedRepo,
  isConsoleModalOpen,
  setIsConsoleModalOpen
}) {
  if (!isSimulatorOpen) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Dashed banner header card (triggers modal on click) */}
      <div 
        className="dev-sandbox-banner" 
        onClick={(e) => {
          // Open the modal, unless user clicked dropdown selection, close button, or trigger button explicitly
          if (e.target.closest('.icon-button') || e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') {
            return;
          }
          setIsConsoleModalOpen(true);
        }}
        style={{ 
          cursor: 'pointer',
          flexDirection: 'column', 
          alignItems: 'stretch', 
          gap: '16px', 
          padding: '20px',
          transition: 'all 0.25s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-teal)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="dev-text" style={{ fontSize: '14px' }}>
            🛠️ <strong>Live PR Audit Console:</strong> Click anywhere on this banner to inspect live logs, or select your repo below and run a fresh audit.
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
              onClick={(e) => {
                e.stopPropagation(); // Avoid double toggle from card container click
                triggerSimulation();
              }} 
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

      {/* Centered Modal Overlay for System Terminal Logs */}
      {isConsoleModalOpen && (
        <div 
          className="console-modal-overlay"
          onClick={() => setIsConsoleModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 15, 30, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            className="console-modal-content glass-panel"
            onClick={(e) => e.stopPropagation()} // Prevent close on inside click
            style={{
              width: '90%',
              maxWidth: '672px', // max-w-2xl
              padding: '24px',
              background: 'rgba(11, 15, 25, 0.96)',
              borderColor: 'rgba(20, 184, 166, 0.35)',
              borderStyle: 'dashed',
              borderRadius: '16px',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(20, 184, 166, 0.1)',
              animation: 'scaleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Close button in top-right */}
            <button 
              onClick={() => setIsConsoleModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '22px',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              &times;
            </button>

            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-teal)', display: 'block', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📟 System Terminal Logs
            </span>

            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              color: '#10b981', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              maxHeight: '350px',
              overflowY: 'auto',
              background: 'rgba(0,0,0,0.3)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.02)'
            }}>
              {simLogs.length > 0 ? (
                simLogs.map((log, index) => (
                  <div key={index} style={{ lineHeight: '1.5' }}>{log}</div>
                ))
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '10px 0' }}>
                  Console idle. Click "Run Live Audit" to begin audit sync.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
