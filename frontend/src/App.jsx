//app.jsx
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
import Repositories from './pages/Repositories';



export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'prs', 'history', 'settings'
  const [audits, setAudits] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
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
  const [isConsoleModalOpen, setIsConsoleModalOpen] = useState(false);

  // Real-time repository selection states
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("srihari2479/DEMO_HACKTHON_Reviewly");
  const [prNumber, setPrNumber] = useState(1);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [errorRepos, setErrorRepos] = useState(null);

  const fetchGitHubRepos = async () => {
    setLoadingRepos(true);
    setErrorRepos(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = session?.provider_token;
      
      if (!providerToken) {
        setErrorRepos("GitHub Access Token not found. Login again.");
        setLoadingRepos(false);
        return;
      }

      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=15', {
        headers: {
          'Authorization': `Bearer ${providerToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      const data = await response.json();
      if (Array.isArray(data)) {
        const formatted = data.map(r => ({
          id: r.id,
          name: r.name,
          owner: r.owner.login,
          fullName: `${r.owner.login}/${r.name}`,
          stars: r.stargazers_count,
          forks: r.forks_count,
          monitored: r.name.toLowerCase().includes('reviewly') || r.name.toLowerCase().includes('hackthon'),
          language: r.language || 'HTML',
          url: r.html_url
        }));
        setRepos(formatted);
        if (formatted.length > 0) {
          setSelectedRepo(formatted[0].fullName);
        }
      } else {
        setErrorRepos("Failed to parse repos from GitHub.");
      }
    } catch (e) {
      setErrorRepos(`Failed to connect to GitHub: ${e.message}`);
    } finally {
      setLoadingRepos(false);
    }
  };

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
      fetchGitHubRepos();
    } else {
      setUser(null);
      setRepos([]);
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
      if (data.status === "success") {
        setAudits(data.data);
        if (data.data.length > 0) {
          // Retain selection if valid, else select first
          setSelectedAuditId(prevId => {
            return data.data.some(a => a.id === prevId) ? prevId : data.data[0].id;
          });
        } else {
          setSelectedAuditId(null);
        }
      }
    } catch (e) {
      console.warn("Backend API not reachable.", e);
    }
  };

  const userAudits = (repos.length === 0 && loadingRepos)
    ? audits
    : audits.filter(audit => 
        repos.some(repo => repo.fullName.toLowerCase() === audit.repository.toLowerCase())
      );

  const activeAudit = userAudits.find(a => a.id === selectedAuditId) || userAudits[0];

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

  const triggerSimulation = async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const getLogTime = () => new Date().toLocaleTimeString('en-US', { hour12: false });
    const appendLog = (message) => {
      setSimLogs(prev => [...prev, { time: getLogTime(), message }]);
    };

    setIsConsoleModalOpen(true);
    setIsSimulating(true);
    setSimLogs([]); // Clear logs initially
    
    // Line 1:
    appendLog(`🚀 Connecting to GitHub API for repository: ${selectedRepo}...`);
    await sleep(600);
    
    // Line 2:
    appendLog("📡 Querying all active open Pull Requests...");
    await sleep(600);
    
    // Line 3:
    appendLog("📡 Checking for un-audited updates...");
    await sleep(600);
    
    // Line 4:
    appendLog("🤖 Querying Groq Llama-3.3 diff summarizers...");
    await sleep(600);
    
    // Line 5:
    appendLog("📸 Querying Gemini 2.5 UI auditors...");

    // Trigger API call in parallel
    const payload = { repository: selectedRepo };
    const apiPromise = fetch(`${BACKEND_URL}/api/pr/audit-repo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    try {
      // Wait for the API request to complete
      const response = await apiPromise;
      const data = await response.json();
      
      // Delay to maintain the clean pacing
      await sleep(600);
      
      if (data.status === "success") {
        // Line 6:
        appendLog(`💾 Sync status: ${data.message}`);
        await sleep(600);
        
        // Line 7:
        appendLog("🎉 Live audit execution complete!");
        
        await fetchAudits();
        
        if (data.audits && data.audits.length > 0) {
          setTimeout(() => {
            setSelectedAuditId(data.audits[0].id);
            setActiveTab('dashboard');
          }, 1000);
        }
      } else {
        const errorDetail = data.detail || "Failed to sync PR details from GitHub.";
        appendLog(`❌ Error: ${errorDetail}`);
        alert(`Audit Trigger Failed: ${errorDetail}\n\nHint: Verify that the repo name is correct and accessible.`);
      }
    } catch (e) {
      await sleep(600);
      appendLog("❌ Connection Error: Backend API not reachable. Ensure uvicorn is running on port 7860.");
      alert("Simulation failed: Unable to connect to the FastAPI backend. Check if uvicorn is running.");
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
            repos={repos}
            selectedRepo={selectedRepo}
            setSelectedRepo={setSelectedRepo}
            isConsoleModalOpen={isConsoleModalOpen}
            setIsConsoleModalOpen={setIsConsoleModalOpen}
          />

          {activeTab === 'dashboard' && (
            <Dashboard 
              audits={userAudits}
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
              audits={userAudits}
              selectedAuditId={selectedAuditId}
              setSelectedAuditId={setSelectedAuditId}
              activeAudit={activeAudit}
              reviewComments={reviewComments}
              setReviewComments={setReviewComments}
              handleReviewSubmit={handleReviewSubmit}
              sliderPosition={sliderPosition}
              setSliderPosition={setSliderPosition}
            />
          )}

          {activeTab === 'history' && (
            <History 
              audits={userAudits}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedAuditId={setSelectedAuditId}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'repos' && (
            <Repositories 
              repos={repos}
              setRepos={setRepos}
              loading={loadingRepos}
              errorMsg={errorRepos}
              user={user}
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
