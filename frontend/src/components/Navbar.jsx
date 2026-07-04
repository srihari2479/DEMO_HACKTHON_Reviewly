import React, { useRef, useEffect } from 'react';
import { Bell, LogOut } from 'lucide-react';

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  isNotificationsOpen,
  setIsNotificationsOpen,
  isProfileOpen,
  setIsProfileOpen,
  notifications,
  handleSignOut
}) {
  const navProfileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (navProfileRef.current && !navProfileRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsNotificationsOpen, setIsProfileOpen]);

  return (
    <header className="navbar glass-panel">
      <div className="brand">
        <img 
          src="/logo.png" 
          alt="Reviewly Logo" 
          style={{ height: '34px', width: 'auto', objectFit: 'contain', marginRight: '8px' }} 
        />
        <span className="brand-wordmark">Reviewly</span>
      </div>
      
      {user && (
        <nav className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-link ${activeTab === 'repos' ? 'active' : ''}`}
            onClick={() => setActiveTab('repos')}
          >
            Repos
          </button>
          <button 
            className={`nav-link ${activeTab === 'prs' ? 'active' : ''}`}
            onClick={() => setActiveTab('prs')}
          >
            PRs
          </button>
          <button 
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
      )}

      <div className="nav-profile" ref={navProfileRef}>
        {user && (
          <>
            {/* Notification bell */}
            <button 
              className="icon-button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
            >
              <Bell size={20} />
              <span className="badge-dot"></span>
            </button>

            {isNotificationsOpen && (
              <div className="dropdown-menu notification-dropdown">
                <div style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--panel-border)', fontSize: '13px' }}>
                  Recent Alerts
                </div>
                {notifications.map(n => (
                  <div key={n.id} className="notification-item">
                    <div className="notification-content">
                      <span className="notification-title">{n.title}</span>
                      <span className="notification-time">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Profile pic */}
            <img 
              src={user.avatar} 
              alt="Profile avatar" 
              className="profile-avatar"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
            />

            {isProfileOpen && (
              <div className="dropdown-menu">
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--panel-border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user.role}</div>
                </div>
                <div className="dropdown-item" onClick={() => setActiveTab('settings')}>Profile Settings</div>
                <div className="dropdown-item" onClick={() => setActiveTab('settings')}>Billing</div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleSignOut}>
                  <LogOut size={14} /> Log Out
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
