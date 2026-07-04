import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function Settings() {
  return (
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
  );
}
