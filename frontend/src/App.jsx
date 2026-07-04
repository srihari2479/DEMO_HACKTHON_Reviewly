import React, { useState, useEffect, useRef } from 'react';
import { 
  GitPullRequest, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Bell, 
  Settings as SettingsIcon, 
  History as HistoryIcon, 
  LayoutDashboard, 
  LogOut, 
  Send, 
  X,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  Sliders,
  Users
} from 'lucide-react';

const Github = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

// Fallback seed data so the UI remains interactive and functional even if backend is starting up.
const SEED_AUDITS = [
  {
    id: "502d3641-abbf-4bfc-b478-40c43e4a9b64",
    pr_number: 104,
    title: "Redesign Login and Add Google OAuth",
    author: "dev_sarah",
    repository: "Reviewly/frontend",
    status: "pending_review",
    git_diff: `diff --git a/components/Login.js b/components/Login.js
index 838afd..92fa1b 100644
--- a/components/Login.js
+++ b/components/Login.js
@@ -10,6 +10,12 @@ export default function Login() {
       <button className="bg-indigo-600 text-white">Sign In</button>
+      <button className="bg-blue-500 text-white flex items-center">
+        <img src="/google-icon.svg" /> Sign in with Google
+      </button>
+      <a href="/signup" className="text-gray-500 mt-8">Don''t have an account? Sign Up</a>`,
    before_screenshot_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
    after_screenshot_url: "https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=600",
    ai_summary: "* Added a blue Google Sign-In button, allowing users to authenticate via Google.\n* Repositioned container spacing and modified margin elements.\n* Inserted a link for signup below the primary login forms.",
    ai_risks: "* Text Typo/Display Error: The link contains an escaped double single quote \"Don''t\" which displays incorrectly.\n* Button Color Inconsistency: The new blue Google button contrast differs from the existing dark button layout.",
    reviewer_comments: null,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "mock-id-2",
    pr_number: 103,
    title: "feat: Update dashboard statistics layout",
    author: "alex_chen",
    repository: "Reviewly/frontend",
    status: "approved",
    git_diff: "diff --git a/src/Dashboard.jsx\n+ <div className=\"metrics-grid\">14 changes...</div>",
    before_screenshot_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600",
    after_screenshot_url: "https://images.unsplash.com/photo-1541462608141-2ff01dd914e0?w=600",
    ai_summary: "* Redesigned the primary statistics panel with standard spacing.\n* Changed metric widgets border borders to glowing elements.",
    ai_risks: "No critical UX risks identified.",
    reviewer_comments: "Looks neat and fits the style guide perfectly!",
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "mock-id-3",
    pr_number: 102,
    title: "fix: Broken signup form inputs layout shift",
    author: "maria_r",
    repository: "Reviewly/backend",
    status: "changes_requested",
    git_diff: "diff --git a/components/SignUp.js\n- margin-bottom: 24px;\n+ margin-bottom: 8px;",
    before_screenshot_url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600",
    after_screenshot_url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600",
    ai_summary: "* Tightened margins on registration text inputs.\n* Repositioned signup error text to be close to fields.",
    ai_risks: "* Spacing issue: The password mismatch warning shifts labels when rendering dynamically.",
    reviewer_comments: "Input layout shifts are still occurring on mobile layout viewport checks.",
    created_at: new Date(Date.now() - 14400000).toISOString()
  }
];

const BACKEND_URL = "http://localhost:7860";

export default function App() {
  const [user, setUser] = useState({
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role: 'Lead Developer'
  });
  
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'prs', 'history', 'settings'
  const [audits, setAudits] = useState(SEED_AUDITS);
  const [selectedAuditId, setSelectedAuditId] = useState(SEED_AUDITS[0].id);
  const [reviewComments, setReviewComments] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Interactive slider position (percent 0-100)
  const [sliderPosition, setSliderPosition] = useState(50);
  
  // Dropdown states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Dev simulation portal states
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(true);
  const [simLogs, setSimLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load audits from FastAPI on startup
  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/pr/list`);
      const data = await response.json();
      if (data.status === "success" && data.data.length > 0) {
        setAudits(data.data);
        setSelectedAuditId(data.data[0].id);
      }
    } catch (e) {
      console.warn("Backend API not reachable. Using fallback seed data.", e);
    }
  };

  const activeAudit = audits.find(a => a.id === selectedAuditId) || audits[0];

  // Post reviewer approval/rejection to FastAPI backend
  const handleReviewSubmit = async (status) => {
    if (!activeAudit) return;
    
    // Update local state immediately for instant feedback
    const updatedAudits = audits.map(a => {
      if (a.id === activeAudit.id) {
        return { ...a, status, reviewer_comments: reviewComments };
      }
      return a;
    });
    setAudits(updatedAudits);
    setReviewComments("");

    try {
      await fetch(`${BACKEND_URL}/api/pr/${activeAudit.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewer_comments: reviewComments
        })
      });
    } catch (e) {
      console.error("Failed to sync review update with backend database.", e);
    }
  };

  // Mock Developer PR submission trigger (hits actual FastAPI endpoint `/submit`)
  const triggerSimulation = async () => {
    setIsSimulating(true);
    setSimLogs([
      "🚀 [Simulator] Developer triggered `git push origin feature/pricing-page`",
      "📦 [Simulator] Pull Request #105 created on GitHub...",
      "🔗 [Simulator] Vercel generated preview deployment: https://reviewly-preview-105.vercel.app",
      "📡 [Simulator] Triggering Reviewly Webhook..."
    ]);

    const payload = {
      pr_number: 105,
      title: "Redesign Pricing Tiers and Add Toggle Button",
      author: "dev_alex",
      repository: "Reviewly/frontend",
      git_diff: `diff --git a/components/Pricing.js b/components/Pricing.js
index 92fa1b..73ac0a 100644
--- a/components/Pricing.js
+++ b/components/Pricing.js
@@ -12,4 +12,12 @@ export default function Pricing() {
-      <h3>Premium Plan: $49/mo</h3>
+      <div className="toggle-pricing">
+        <span>Monthly</span><button className="bg-teal-500">Toggle</button><span>Annually</span>
+      </div>
+      <h3>Premium Plan: $39/mo (Billed Annually)</h3>
+      <a href="/checkout" className="btn mt-4">Get Started</a>`,
      before_screenshot_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600",
      after_screenshot_url: "https://images.unsplash.com/photo-1541462608141-2ff01dd914e0?w=600",
      portal_base_url: window.location.origin
    };

    try {
      setSimLogs(prev => [...prev, "🤖 [Simulator] Running Groq diff parser..."]);
      setSimLogs(prev => [...prev, "📸 [Simulator] Running Gemini multimodal visual auditor..."]);
      
      const response = await fetch(`${BACKEND_URL}/api/pr/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.status === "success") {
        setSimLogs(prev => [
          ...prev,
          "💾 [Simulator] PR Audit written to Supabase successfully!",
          "💬 [Simulator] Slack message alert triggered!",
          "🎉 [Simulator] Process completed successfully! Refreshing portal..."
        ]);
        await fetchAudits();
        setSelectedAuditId(data.audit.id);
        setActiveTab('dashboard');
      } else {
        setSimLogs(prev => [...prev, "❌ Error: Failed to submit simulated audit payload."]);
      }
    } catch (e) {
      // Fallback manual injection in case API is offline
      setSimLogs(prev => [
        ...prev,
        "⚠️ Backend API not reachable. Simulating AI analysis locally...",
        "💾 Local database fallback record created."
      ]);
      const mockNewAudit = {
        id: "simulation-audit-uuid",
        pr_number: 105,
        title: "Redesign Pricing Tiers and Add Toggle Button",
        author: "dev_alex",
        repository: "Reviewly/frontend",
        status: "pending_review",
        git_diff: payload.git_diff,
        before_screenshot_url: payload.before_screenshot_url,
        after_screenshot_url: payload.after_screenshot_url,
        ai_summary: "* Added an annual/monthly pricing toggle button.\n* Changed pricing premium plans text to show discounted annual billings.",
        ai_risks: "* Visual Clipping Risk: The new toggle container overlaps with top nav menu on small viewport profiles.\n* Missing Info Tooltip: Annual billing calculations are not detailed near the checkout links.",
        reviewer_comments: null,
        created_at: new Date().toISOString()
      };
      setAudits([mockNewAudit, ...audits]);
      setSelectedAuditId(mockNewAudit.id);
      setActiveTab('dashboard');
    } finally {
      setIsSimulating(false);
    }
  };

  // Image Slider Drag event handler
  const sliderRef = useRef(null);
  
  const handleSliderMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // Scoped notifications mapping
  const notifications = [
    { id: 1, title: `New audit generated for PR #${activeAudit?.pr_number || 104}`, time: "3 minutes ago" },
    { id: 2, title: "Review approved for PR #103", time: "2 hours ago" },
    { id: 3, title: "Alex Chen requested changes on PR #102", time: "4 hours ago" }
  ];

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar glass-panel">
        <div className="brand">
          <div className="brand-logo">&lt;R&gt;</div>
          <span>Reviewly</span>
        </div>
        
        <nav className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSelectedAuditId(audits[0]?.id); }}
          >
            Dashboard
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

        <div className="nav-profile">
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
              <div className="dropdown-item" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setUser(null)}>
                <LogOut size={14} /> Log Out
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      {user === null ? (
        /* Login Screen Gate */
        <div className="login-container">
          <div className="login-card glass-panel glass-panel-glow">
            <div className="login-logo">&lt;R&gt;</div>
            <h2>Sign in to Reviewly</h2>
            <button 
              className="btn-primary"
              onClick={() => setUser({
                name: 'Alex Chen',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                role: 'Lead Developer'
              })}
            >
              <Github size={20} /> Login with GitHub
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Secure authentication via GitHub OAuth</span>
          </div>
        </div>
      ) : (
        /* Authenticated Main Tabs */
        <main>
          {activeTab === 'dashboard' && (
            <div>
              {/* Dev Simulator Panel Header */}
              {isSimulatorOpen && (
                <div className="dev-sandbox-banner">
                  <span className="dev-text">🛠️ <strong>Hackathon Simulator Portal:</strong> Trigger a mock webhook event to audit a new code commit live.</span>
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
              )}

              {/* Top Metrics widgets */}
              <div className="metrics-grid">
                <div className="metric-card glass-panel">
                  <div className="metric-icon-wrapper">
                    <GitPullRequest size={24} />
                  </div>
                  <div className="metric-info">
                    <h4>{audits.length + 11} changes</h4>
                    <p>detected today</p>
                  </div>
                </div>
                <div className="metric-card glass-panel">
                  <div className="metric-icon-wrapper">
                    <Clock size={24} />
                  </div>
                  <div className="metric-info">
                    <h4>24s</h4>
                    <p>Avg review time</p>
                  </div>
                </div>
                <div className="metric-card glass-panel">
                  <div className="metric-icon-wrapper">
                    <CheckCircle size={24} />
                  </div>
                  <div className="metric-info">
                    <h4>97% approval</h4>
                    <p>rate</p>
                  </div>
                </div>
              </div>

              {/* Main dashboard columns */}
              <div className="dashboard-grid">
                {/* Left Column: Recent pull requests */}
                <div className="glass-panel" style={{ height: '520px', display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header">
                    <span className="panel-title">Recent Pull Requests</span>
                  </div>
                  
                  <div className="pr-list">
                    {audits.map(audit => (
                      <div 
                        key={audit.id} 
                        className={`pr-item ${selectedAuditId === audit.id ? 'active' : ''}`}
                        onClick={() => setSelectedAuditId(audit.id)}
                      >
                        <img 
                          src={`https://images.unsplash.com/photo-${audit.author === 'dev_sarah' ? '1494790108377-be9c29b29330' : '1535713875002-d1d0cf377fde'}?w=100`} 
                          alt="avatar" 
                          className="pr-avatar" 
                        />
                        <div className="pr-details">
                          <span className="pr-title">{audit.title}</span>
                          <span className="pr-repo">{audit.repository}</span>
                          <div className="pr-meta">
                            <span className={`badge ${
                              audit.status === 'approved' ? 'badge-merged' : 
                              audit.status === 'changes_requested' ? 'badge-rejected' : 'badge-review'
                            }`}>
                              {audit.status === 'approved' ? 'Approved' : audit.status === 'changes_requested' ? 'Changes Requested' : 'In Review'}
                            </span>
                            <span className="time-text">1 hr ago</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Visual before/after slider comparison */}
                <div className="glass-panel slider-container">
                  <div className="slider-tabs">
                    <span className="tab-pill before">Before</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Drag slider left & right to inspect UI shifts
                    </span>
                    <span className="tab-pill after">After</span>
                  </div>

                  {activeAudit ? (
                    <div 
                      ref={sliderRef}
                      className="diff-slider-wrapper"
                      onMouseMove={handleMouseMove}
                      onTouchMove={handleTouchMove}
                      onMouseDown={(e) => handleSliderMove(e.clientX)}
                    >
                      {/* Before Screenshot */}
                      <img 
                        src={activeAudit.before_screenshot_url} 
                        className="slider-image-before" 
                        alt="Staging UI Before" 
                      />
                      
                      {/* After Screenshot with clip-path polygon overlay */}
                      <img 
                        src={activeAudit.after_screenshot_url} 
                        className="slider-image-after" 
                        style={{ 
                          clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` 
                        }}
                        alt="Staging UI After" 
                      />

                      {/* Slider divider line handle */}
                      <div className="slider-handle" style={{ left: `${sliderPosition}%` }}>
                        <span>&lt;&gt;</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      Select a pull request to compare visual screenshots.
                    </div>
                  )}

                  {activeAudit && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        PR #{activeAudit.pr_number} by <strong>{activeAudit.author}</strong>
                      </span>
                      <button className="btn-secondary" onClick={() => setActiveTab('prs')}>
                        Audit Code & Submit Review
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dev Simulation logs */}
              {isSimulatorOpen && simLogs.length > 0 && (
                <div className="glass-panel" style={{ marginTop: '24px', padding: '16px', background: 'rgba(0, 0, 0, 0.4)', borderStyle: 'dashed' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-teal)', display: 'block', marginBottom: '8px' }}>Simulation Console Outputs:</span>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {simLogs.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prs' && (
            <div className="detail-container">
              {activeAudit ? (
                <div>
                  <div className="detail-header">
                    <div className="detail-header-left">
                      <div className="detail-title-row">
                        <span className="detail-title">{activeAudit.title}</span>
                        <span className={`badge ${
                          activeAudit.status === 'approved' ? 'badge-merged' : 
                          activeAudit.status === 'changes_requested' ? 'badge-rejected' : 'badge-review'
                        }`}>
                          {activeAudit.status === 'approved' ? 'Approved' : activeAudit.status === 'changes_requested' ? 'Changes Requested' : 'Pending Review'}
                        </span>
                      </div>
                      <span className="detail-subtitle">
                        Repository: <strong>{activeAudit.repository}</strong> | Pull Request <strong>#{activeAudit.pr_number}</strong> submitted by <strong>{activeAudit.author}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="detail-grid" style={{ marginTop: '24px' }}>
                    {/* Left side: AI analysis boxes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* AI Summary */}
                      <div className="glass-panel info-section">
                        <span className="info-section-title">AI Explanations (Groq)</span>
                        <ul className="bullet-list">
                          {activeAudit.ai_summary.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                            <li key={idx}>
                              {line.startsWith('*') ? line.substring(1).trim() : line}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Visual Risks */}
                      <div className="glass-panel info-section">
                        <span className="info-section-title" style={{ borderLeftColor: '#ef4444' }}>Visual UX Risks Flagged (Gemini 2.5 Flash)</span>
                        <ul className="bullet-list">
                          {activeAudit.ai_risks.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                            <li key={idx} style={{ color: line.includes('High') || line.includes('Risk') ? '#ef4444' : 'var(--text-secondary)' }}>
                              {line.startsWith('*') ? line.substring(1).trim() : line}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Code Diff view */}
                      <div className="glass-panel info-section">
                        <span className="info-section-title" style={{ borderLeftColor: '#6366f1' }}>Code changes (git diff)</span>
                        <pre style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '12px', 
                          padding: '16px', 
                          background: 'rgba(0,0,0,0.3)', 
                          borderRadius: '8px', 
                          overflowX: 'auto',
                          border: '1px solid rgba(255,255,255,0.05)',
                          color: '#e2e8f0'
                        }}>
                          <code>{activeAudit.git_diff}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Right side: Review Submission form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div className="glass-panel review-panel">
                        <span className="info-section-title">Submit PR Feedback</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          As a Product Manager or Stakeholder, submit single-click status updates to the engineering team.
                        </span>
                        
                        <textarea 
                          className="comment-textarea"
                          placeholder="Add comments (e.g. 'Align buttons', 'Typo fixes needed')..."
                          value={reviewComments}
                          onChange={(e) => setReviewComments(e.target.value)}
                        />

                        <div className="btn-row">
                          <button className="btn-approve" onClick={() => handleReviewSubmit('approved')}>
                            Approve
                          </button>
                          <button className="btn-changes" onClick={() => handleReviewSubmit('changes_requested')}>
                            Request Changes
                          </button>
                        </div>
                      </div>

                      {/* Current Comments */}
                      {activeAudit.reviewer_comments && (
                        <div className="glass-panel info-section" style={{ borderLeft: '3px solid var(--primary-teal)' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Reviewer Comments:</span>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>"{activeAudit.reviewer_comments}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No active audits found. Trigger a simulation to generate records.
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-container">
              <div className="history-header">
                <span className="history-title">Review History</span>
              </div>

              {/* Filter pills and Search */}
              <div className="filters-row">
                <div className="filter-pills">
                  <button 
                    className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-pill ${statusFilter === 'approved' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('approved')}
                  >
                    Approved
                  </button>
                  <button 
                    className={`filter-pill ${statusFilter === 'changes_requested' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('changes_requested')}
                  >
                    Rejected
                  </button>
                </div>

                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search reviews, PRs, or authors..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th className="history-th">PR</th>
                      <th className="history-th">Date</th>
                      <th className="history-th">Changes</th>
                      <th className="history-th">Reviewer</th>
                      <th className="history-th">Status</th>
                      <th className="history-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits
                      .filter(audit => {
                        const matchesSearch = 
                          audit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          audit.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          audit.repository.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        const matchesFilter = 
                          statusFilter === 'all' || 
                          audit.status === statusFilter;
                        
                        return matchesSearch && matchesFilter;
                      })
                      .map(audit => (
                        <React.Fragment key={audit.id}>
                          <tr className="history-tr">
                            <td className="history-td-panel">
                              <span className="history-pr-title">#{audit.pr_number}: {audit.title}</span>
                            </td>
                            <td className="history-td-panel" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(audit.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="history-td-panel">
                              <div className="changes-count">
                                <img src={audit.after_screenshot_url} className="changes-thumbnail" alt="thumbnail" />
                                <span style={{ fontSize: '13px' }}>UI Redesign Details</span>
                              </div>
                            </td>
                            <td className="history-td-panel">
                              <div className="reviewer-cell">
                                <img 
                                  src={`https://images.unsplash.com/photo-${audit.author === 'dev_sarah' ? '1494790108377-be9c29b29330' : '1535713875002-d1d0cf377fde'}?w=80`} 
                                  className="reviewer-avatar" 
                                  alt="reviewer" 
                                />
                                <span style={{ fontSize: '13px' }}>{audit.author}</span>
                              </div>
                            </td>
                            <td className="history-td-panel">
                              <span className={`badge ${
                                audit.status === 'approved' ? 'badge-merged' : 
                                audit.status === 'changes_requested' ? 'badge-rejected' : 'badge-review'
                              }`}>
                                {audit.status === 'approved' ? 'Approved' : audit.status === 'changes_requested' ? 'Changes Requested' : 'In Review'}
                              </span>
                            </td>
                            <td className="history-td-panel">
                              <button 
                                className="btn-secondary" 
                                style={{ padding: '6px 14px' }}
                                onClick={() => {
                                  setSelectedAuditId(audit.id);
                                  setActiveTab('prs');
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                          <tr className="spacer-row"></tr>
                        </React.Fragment>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="history-container">
              <div className="history-header">
                <span className="history-title">Settings</span>
              </div>

              <div className="settings-grid" style={{ marginTop: '12px' }}>
                {/* Slack Integration */}
                <div className="glass-panel settings-card">
                  <span className="settings-card-title">Slack Integration</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Post automated AI summaries and before/after slider links directly to your product team's Slack channels.
                  </span>
                  
                  <div className="slack-integration-wrapper">
                    <div className="slack-info">
                      <div className="slack-logo-bg">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" className="slack-logo" alt="Slack" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Slack Integration</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Connected workspace</div>
                      </div>
                    </div>
                    <div className="slack-status"></div>
                  </div>

                  <button className="btn-primary" style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', boxShadow: 'none' }}>
                    Disconnect Workspace
                  </button>
                </div>

                {/* Notifications Preferences */}
                <div className="glass-panel settings-card">
                  <span className="settings-card-title">Notification Preferences</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Configure when Reviewly publishes summaries and alerts to your channels.
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="toggle-row">
                      <span className="toggle-label">Email Digests</span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="toggle-row">
                      <span className="toggle-label">Slack Alerts</span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="toggle-row">
                      <span className="toggle-label">In-app Notifications</span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Detection Rules */}
                <div className="glass-panel settings-card">
                  <span className="settings-card-title">Detection Rules</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Customize pull request filters to only trigger visual audits on specified commits.
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="toggle-row">
                      <span className="toggle-label">
                        Auto-Identify PRs <HelpCircle size={14} className="info-trigger" title="Automatically reviews PRs containing user-facing changes" />
                      </span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="toggle-row">
                      <span className="toggle-label">
                        Keyword Matching <HelpCircle size={14} className="info-trigger" title="Filter commits containing keywords like UI, feat, css" />
                      </span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="toggle-row">
                      <span className="toggle-label">
                        Ignore Drafts <HelpCircle size={14} className="info-trigger" title="Skip processing draft pull requests" />
                      </span>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="glass-panel settings-card">
                  <span className="settings-card-title">Team Members</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Add stakeholders who need single-click audit privileges.
                  </span>
                  
                  <div className="team-list">
                    <div className="team-member">
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" className="member-avatar" alt="member" />
                      <span className="member-name">Alex Chen</span>
                      <span className="member-role">Admin</span>
                    </div>
                    <div className="team-member">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" className="member-avatar" alt="member" style={{ borderColor: '#a855f7' }} />
                      <span className="member-name">Maria R.</span>
                      <span className="member-role">Reviewer</span>
                    </div>
                    <div className="team-member">
                      <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100" className="member-avatar" alt="member" style={{ borderColor: '#6366f1' }} />
                      <span className="member-name">David K.</span>
                      <span className="member-role">Member</span>
                    </div>

                    <button className="btn-secondary" style={{ marginLeft: 'auto' }}>Invite Member</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
