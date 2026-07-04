import React from 'react';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export default function Login({ loginWithGitHub }) {
  return (
    <div className="login-container">
      <div className="login-card glass-panel glass-panel-glow">
        <div className="login-logo">&lt;R&gt;</div>
        <h2>Sign in to Reviewly</h2>
        <button 
          className="btn-primary"
          onClick={loginWithGitHub}
        >
          <GithubIcon size={20} /> Login with GitHub
        </button>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Secure authentication via GitHub OAuth
        </span>
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '11px', color: 'var(--status-review-text)', textAlign: 'left', lineHeight: '1.4' }}>
          <strong>Prerequisite:</strong> Enable the GitHub auth provider in your Supabase Console under <em>Authentication &gt; Providers</em> before clicking login.
        </div>
      </div>
    </div>
  );
}
