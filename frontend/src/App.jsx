import React, { useState, useEffect } from 'react';
import { supabase, BACKEND_URL } from './services/supabase';

// Components
import Navbar from './components/Navbar';
import SimulatorConsole from './components/SimulatorConsole';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PRDetails from './pages/PRDetails';
import History from './pages/History';
import Settings from './pages/Settings';

// Fallback seed data in case Supabase is blank
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
  }
];

export default function App() {
  const [user, setUser] = useState(null);
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

  // 1. Listen to Supabase Auth state changes
  useEffect(() => {
    // Check active session on page mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    // Listen for auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthChange = (session) => {
    if (session?.user) {
      setUser({
        name: session.user.user_metadata.full_name || session.user.user_metadata.user_name || session.user.email,
        avatar: session.user.user_metadata.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        role: 'Reviewer',
        email: session.user.email
      });
    } else {
      setUser(null);
    }
  };

  const loginWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        alert(`Supabase Auth Error: ${error.message}\n\nHint: Ensure 'GitHub' is enabled in your Supabase Dashboard under Authentication -> Providers.`);
      }
    } catch (e) {
      console.error("Authentication trigger failed.", e);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsProfileOpen(false);
  };

  // 2. Fetch audits from backend API
  useEffect(() => {
    fetchAudits();
  }, []);

  // 3. Connect Supabase Realtime to update dashboard lists automatically on insert/update
  useEffect(() => {
    const channel = supabase
      .channel('realtime_pr_audits_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pr_audits' },
        (payload) => {
          console.log('Real-time database update detected:', payload);
          fetchAudits(); // Reload active pull requests list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAudits = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/pr/list`);
      const data = await response.json();
      if (data.status === "success" && data.data.length > 0) {
        setAudits(data.data);
        // Retain selection if valid, else select first
        setSelectedAuditId(prevId => {
          return data.data.some(a => a.id === prevId) ? prevId : data.data[0].id;
        });
      }
    } catch (e) {
      console.warn("Backend API not reachable. Using fallback seed data.", e);
    }
  };

  const activeAudit = audits.find(a => a.id === selectedAuditId) || audits[0];

  // Post reviewer approval/rejection to FastAPI backend
  const handleReviewSubmit = async (status) => {
    if (!activeAudit) return;
    
    // Update local state immediately for snappy response
    const updatedAudits = audits.map(a => {
      if (a.id === activeAudit.id) {
        return { ...a, status, reviewer_comments: reviewComments };
      }
      return a;
    });
    setAudits(updatedAudits);
    setReviewComments("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/pr/${activeAudit.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewer_comments: reviewComments
        })
      });
      const data = await response.json();
      if (data.status === "success") {
        fetchAudits(); // Re-sync
      }
    } catch (e) {
      console.error("Failed to sync review update with backend database.", e);
    }
  };

  // Mock Developer PR submission trigger (hits actual FastAPI endpoint `/submit`)
  const triggerSimulation = async () => {
    setIsSimulating(true);
    setSimLogs([
      "🚀 [Simulator] Developer pushed changes to `feature/pricing-page`",
      "📦 [Simulator] PR #105 generated on GitHub repository...",
      "🔗 [Simulator] Vercel staging preview generated: https://reviewly-preview-105.vercel.app",
      "📡 [Simulator] Triggering Reviewly Audit Pipeline..."
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
      setSimLogs(prev => [...prev, "🤖 [Simulator] Querying Groq Llama-3.3 diff parser..."]);
      setSimLogs(prev => [...prev, "📸 [Simulator] Querying Gemini 2.5 multimodal UI auditor..."]);
      
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
          "🎉 [Simulator] Process completed successfully! Real-time DB listeners updated UI."
        ]);
        
        setTimeout(() => {
          setSelectedAuditId(data.audit.id);
          setActiveTab('dashboard');
        }, 500);
      } else {
        setSimLogs(prev => [...prev, "❌ Error: Failed to submit simulated audit payload."]);
      }
    } catch (e) {
      setSimLogs(prev => [
        ...prev,
        "⚠️ Backend API not reachable. Simulating AI analysis locally...",
        "💾 Local database fallback record injected."
      ]);
      const mockNewAudit = {
        id: `simulated-id-${Date.now()}`,
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

  // Scoped notifications mapping
  const notifications = [
    { id: 1, title: `New audit generated for PR #${activeAudit?.pr_number || 104}`, time: "3 minutes ago" },
    { id: 2, title: "Review approved for PR #103", time: "2 hours ago" },
    { id: 3, title: "Alex Chen requested changes on PR #102", time: "4 hours ago" }
  ];

  return (
    <div className="app-container">
      {/* Navigation bar */}
      <Navbar 
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isNotificationsOpen={isNotificationsOpen}
        setIsNotificationsOpen={setIsNotificationsOpen}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        notifications={notifications}
        handleSignOut={handleSignOut}
      />

      {/* Main Body */}
      {user === null ? (
        /* Login Screen Gate */
        <Login loginWithGitHub={loginWithGitHub} />
      ) : (
        /* Authenticated Main Tabs */
        <main>
          {/* Dev Simulator Panel Header */}
          <SimulatorConsole 
            isSimulatorOpen={isSimulatorOpen}
            setIsSimulatorOpen={setIsSimulatorOpen}
            isSimulating={isSimulating}
            triggerSimulation={triggerSimulation}
            simLogs={simLogs}
          />

          {activeTab === 'dashboard' && (
            <Dashboard 
              audits={audits}
              selectedAuditId={selectedAuditId}
              setSelectedAuditId={setSelectedAuditId}
              activeAudit={activeAudit}
              sliderPosition={sliderPosition}
              setSliderPosition={setSliderPosition}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'prs' && (
            <PRDetails 
              activeAudit={activeAudit}
              reviewComments={reviewComments}
              setReviewComments={setReviewComments}
              handleReviewSubmit={handleReviewSubmit}
            />
          )}

          {activeTab === 'history' && (
            <History 
              audits={audits}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedAuditId={setSelectedAuditId}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <Settings />
          )}
        </main>
      )}
    </div>
  );
}
