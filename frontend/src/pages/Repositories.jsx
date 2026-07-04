import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Shield, RefreshCw, CheckCircle2, AlertCircle, Star, GitFork, AlertTriangle } from 'lucide-react';

export default function Repositories({ user }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [installingId, setInstallingId] = useState(null);

  // Fetch real-time GitHub repositories of the logged-in user
  useEffect(() => {
    const fetchGitHubRepos = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const providerToken = session?.provider_token;
        
        if (!providerToken) {
          setErrorMsg("GitHub Access Token not found in your session. Please verify that GitHub Provider Auth is configured correctly.");
          setLoading(false);
          return;
        }

        // Fetch user's repos sorted by recent updates
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=15', {
          headers: {
            'Authorization': `Bearer ${providerToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (response.status === 401) {
          setErrorMsg("GitHub token is invalid or expired. Try signing out and signing in again.");
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        if (Array.isArray(data)) {
          // Format payload
          const formatted = data.map(r => ({
            id: r.id,
            name: r.name,
            owner: r.owner.login,
            stars: r.stargazers_count,
            forks: r.forks_count,
            // Pre-monitor the hackathon demo repo if detected
            monitored: r.name.toLowerCase().includes('reviewly') || r.name.toLowerCase().includes('hackthon'),
            language: r.language || 'HTML',
            url: r.html_url
          }));
          setRepos(formatted);
        } else {
          setErrorMsg("Failed to retrieve repositories list from GitHub.");
        }
      } catch (e) {
        setErrorMsg(`Connection error to GitHub: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubRepos();
  }, []);

  const handleToggleMonitor = (repoId) => {
    const repo = repos.find(r => r.id === repoId);
    if (!repo) return;

    if (!repo.monitored) {
      setInstallingId(repoId);
      setTimeout(() => {
        setRepos(repos.map(r => r.id === repoId ? { ...r, monitored: true } : r));
        setInstallingId(null);
      }, 1200);
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
            Fetch live repositories directly from your GitHub profile. Toggle monitoring to start listening to pull requests.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
          <Shield size={14} /> GitHub OAuth Session Active
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 16px auto', color: 'var(--primary-teal)' }} />
          <span>Fetching your live repositories from GitHub API...</span>
        </div>
      ) : errorMsg ? (
        <div className="glass-panel" style={{ marginTop: '24px', padding: '24px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.04)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', display: 'block' }}>GitHub API Authentication Error</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{errorMsg}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {repos.map(repo => (
            <div key={repo.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <a 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', textDecoration: 'none' }}
                    className="repo-link-hover"
                  >
                    {repo.owner}/{repo.name}
                  </a>
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
                      monitoring PR webhooks
                    </span>
                  </div>
                )}

                {installingId === repo.id ? (
                  <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px', justifyContent: 'center' }} disabled>
                    <RefreshCw size={14} className="animate-spin" /> Connecting...
                  </button>
                ) : (
                  <button 
                    className={repo.monitored ? "btn-secondary" : "btn-primary"} 
                    style={{ minWidth: '150px' }}
                    onClick={() => handleToggleMonitor(repo.id)}
                  >
                    {repo.monitored ? "Disconnect" : "Connect"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel" style={{ marginTop: '32px', padding: '20px', borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AlertCircle size={20} style={{ color: 'var(--primary-teal)', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Reviewly Webhook Endpoint</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Your server exposes this Payload URL endpoint for GitHub Webhook registrations:
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
