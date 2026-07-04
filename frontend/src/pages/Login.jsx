import React from 'react';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export default function Login({ loginWithGitHub }) {
  return (
    <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', background: 'transparent' }}>
      {/* Center login card */}
      <div 
        className="login-card glass-panel" 
        style={{ 
          zIndex: 1, 
          background: 'rgba(11, 21, 41, 0.82)', /* glassy dark navy 82% opacity */
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(20, 184, 166, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(20, 184, 166, 0.15)',
          padding: '44px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '440px',
          borderRadius: '18px'
        }}
      >
        <img 
          src="/logo_icon.png" 
          alt="Reviewly Logo Mark" 
          style={{ 
            width: '60px', 
            height: '60px', 
            objectFit: 'contain', 
            marginBottom: '4px',
            filter: 'drop-shadow(0 0 10px rgba(20, 184, 166, 0.3))'
          }} 
        />
        
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.015em' }}>
          Sign in to Reviewly
        </h2>
        
        <button 
          className="btn-primary"
          onClick={loginWithGitHub}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            height: '46px',
            fontWeight: 700,
            fontSize: '14px',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
            boxShadow: '0 0 20px rgba(20, 184, 166, 0.25)',
            border: 'none',
            borderRadius: '24px',
            color: '#0f172a',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(20, 184, 166, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.25)';
          }}
        >
          <GithubIcon size={20} /> Login with GitHub
        </button>
        
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Secure authentication via GitHub OAuth
        </span>

        {/* Prerequisite Notice Box */}
        <div style={{ 
          marginTop: '8px', 
          padding: '14px 16px', 
          background: 'rgba(245, 158, 11, 0.06)', 
          border: '1px dashed rgba(245, 158, 11, 0.25)', 
          borderRadius: '10px', 
          fontSize: '11px', 
          color: 'var(--status-review-text)', 
          textAlign: 'left', 
          lineHeight: '1.5' 
        }}>
          <strong>Prerequisite:</strong> Enable the GitHub auth provider in your Supabase Console under <em>Authentication &gt; Providers</em> before clicking login.
        </div>
      </div>
    </div>
  );
}
