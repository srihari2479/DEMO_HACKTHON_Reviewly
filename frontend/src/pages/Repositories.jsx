import React, { useState } from 'react';
import { Shield, RefreshCw, CheckCircle2, AlertCircle, Link2, GitFork, Star } from 'lucide-react';

export default function Repositories({ user }) {
  // Mock listing of user's GitHub Repositories for the demo onboarding
  const [repos, setRepos] = useState([
    { id: 1, name: 'DEMO_HACKTHON_Reviewly', owner: user?.name || 'srihari2479', stars: 2, forks: 0, monitored: true, language: 'JavaScript' },
    { id: 2, name: 'TaskManager', owner: user?.name || 'srihari2479', stars: 12, forks: 3, monitored: false, language: 'Go' },
    { id: 3, name: 'AI-Visual-Differ', owner: user?.name || 'srihari2479', stars: 45, forks: 8, monitored: false, language: 'Python' },
    { id: 4, name: 'dev-simulator-cli', owner: user?.name || 'srihari2479', stars: 8, forks: 1, monitored: false, language: 'TypeScript' }
  ]);

  const [installingId, setInstallingId] = useState(null);

  const handleToggleMonitor = (repoId) => {
    const repo = repos.find(r => r.id === repoId);
    if (!repo) return;

    if (!repo.monitored) {
      // Simulate webhook registration animation
      setInstallingId(repoId);
      setTimeout(() => {
        setRepos(repos.map(r => r.id === repoId ? { ...r, monitored: true } : r));
        setInstallingId(null);
      }, 1500);
    } else {
      setRepos(repos.map(r => r.id === repoId ? { ...r, monitored: false } : r));
    }
  };

  return (
    <div className="history-container">
      <div className="history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="history-title">GitHub Repositories</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Choose which repositories you want Reviewly to monitor. We will automatically listen to incoming pull requests.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
          <Shield size={14} /> Active Webhook Tunnel
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {repos.map(repo => (
          <div key={repo.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>
                  {repo.owner}/{repo.name}
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                  {repo.language}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={13} /> {repo.stars} stars</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><GitFork size={13} /> {repo.forks} forks</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {repo.monitored && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> Webhook Active
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    hooks.slack.com & lhr.life active
                  </span>
                </div>
              )}

              {installingId === repo.id ? (
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px', justifyContent: 'center' }} disabled>
                  <RefreshCw size={14} className="animate-spin" /> Registering Hook...
                </button>
              ) : (
                <button 
                  className={repo.monitored ? "btn-secondary" : "btn-primary"} 
                  style={{ minWidth: '150px' }}
                  onClick={() => handleToggleMonitor(repo.id)}
                >
                  {repo.monitored ? "Disconnect Hook" : "Connect Repository"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ marginTop: '32px', padding: '20px', borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AlertCircle size={20} style={{ color: 'var(--primary-teal)', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Manual Webhook Configuration</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              If you are configuring a custom CI/CD runner or a self-hosted GitHub Enterprise instance, add this URL as a Pull Request webhook:
            </span>
            <code style={{ fontSize: '12px', color: 'var(--primary-teal)', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '4px', marginTop: '4px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
              https://eba768873272c1.lhr.life/api/pr/webhook
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
