import React, { useEffect } from 'react';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export default function Login({ loginWithGitHub }) {
  // Dynamically configure the body background image for the login page
  useEffect(() => {
    const originalBg = document.body.style.backgroundImage;
    const originalBgColor = document.body.style.backgroundColor;
    const originalBgSize = document.body.style.backgroundSize;
    const originalBgPos = document.body.style.backgroundPosition;
    const originalBgRep = document.body.style.backgroundRepeat;
    const originalBgAtt = document.body.style.backgroundAttachment;
    
    document.body.style.backgroundImage = 'url(/login_page_bg.jpeg)';
    document.body.style.backgroundColor = '#0a0f1e';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
    
    return () => {
      // Revert styles when unmounting
      document.body.style.backgroundImage = originalBg;
      document.body.style.backgroundColor = originalBgColor;
      document.body.style.backgroundSize = originalBgSize;
      document.body.style.backgroundPosition = originalBgPos;
      document.body.style.backgroundRepeat = originalBgRep;
      document.body.style.backgroundAttachment = originalBgAtt;
    };
  }, []);

  return (
    <div 
      className="login-container" 
      style={{ 
        position: 'fixed', 
        top: '80px', 
        left: 0, 
        right: 0, 
        bottom: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
        margin: 0,
        zIndex: 1
      }}
    >
      {/* Center login card (nudged slightly upward using transform) */}
      <div 
        className="login-card glass-panel" 
        style={{ 
          background: 'rgba(10, 15, 30, 0.82)', /* glassy dark navy 82% opacity */
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(20, 184, 166, 0.28)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(20, 184, 166, 0.18)',
          borderRadius: '20px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '440px',
          margin: 0,
          transform: 'translateY(-40px)', /* Nudge slightly upward */
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Logo and Rounded Inverted Triangle Frame Container */}
        <div style={{ 
          position: 'relative', 
          width: '110px', 
          height: '110px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '8px' 
        }}>
          {/* Inverted rounded-corner triangle shape */}
          <div style={{ 
            position: 'absolute', 
            width: '110px', 
            height: '110px', 
            zIndex: 0, 
            filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3))' 
          }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <path 
                d="M 18 20 L 82 20 L 50 78 Z" 
                fill="#f8fafc" 
                stroke="#f8fafc" 
                strokeWidth="14" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>

          {/* Logo Mark on top */}
          <img 
            src="/logo_icon.png" 
            alt="Reviewly Logo Mark" 
            style={{ 
              position: 'absolute',
              width: '110px', 
              height: '110px', 
              objectFit: 'contain', 
              zIndex: 1,
              transform: 'translateY(-3px)' /* Visual balance tweak */
            }} 
          />
        </div>
        
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
            transition: 'all 0.2s ease',
            margin: 0
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
          lineHeight: '1.5',
          margin: 0
        }}>
          <strong>Prerequisite:</strong> Enable the GitHub auth provider in your Supabase Console under <em>Authentication &gt; Providers</em> before clicking login.
        </div>
      </div>
    </div>
  );
}
