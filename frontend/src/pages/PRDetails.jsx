import React from 'react';
import DiffSlider from '../components/DiffSlider';
import { CheckCircle2, AlertTriangle, Shield, User, CornerDownRight } from 'lucide-react';

export default function PRDetails({
  audits = [],
  selectedAuditId,
  setSelectedAuditId,
  activeAudit,
  reviewComments,
  setReviewComments,
  handleReviewSubmit,
  sliderPosition,
  setSliderPosition
}) {
  return (
    <div className="dashboard-grid">
      {/* Left Column: List of PR Audits */}
      <div className="sidebar-prs glass-panel" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <span className="sidebar-title">Active Audits</span>
        <div className="pr-list">
          {audits.length > 0 ? (
            audits.map(audit => (
              <div 
                key={audit.id} 
                className={`pr-item ${selectedAuditId === audit.id ? 'active' : ''}`}
                onClick={() => setSelectedAuditId(audit.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={`https://images.unsplash.com/photo-${audit.author === 'dev_sarah' ? '1494790108377-be9c29b29330' : '1535713875002-d1d0cf377fde'}?w=100`} 
                    alt="avatar" 
                    className="pr-avatar" 
                  />
                  <div className="pr-details" style={{ width: '100%' }}>
                    <span className="pr-title" style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                      {audit.title}
                    </span>
                    <span className="pr-repo" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {audit.repository}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span className={`badge ${
                        audit.status === 'approved' ? 'badge-merged' : 
                        audit.status === 'changes_requested' ? 'badge-rejected' : 'badge-review'
                      }`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {audit.status === 'approved' ? 'Approved' : audit.status === 'changes_requested' ? 'Rejected' : 'In Review'}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <User size={10} /> {audit.author}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No active pull requests found.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: PR Details & Comparison Report */}
      <div className="detail-container" style={{ margin: 0, padding: 0 }}>
        {activeAudit ? (
          <div>
            {/* Header info */}
            <div className="detail-header" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <div className="detail-header-left">
                <div className="detail-title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="detail-title" style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
                    {activeAudit.title}
                  </span>
                  <span className={`badge ${
                    activeAudit.status === 'approved' ? 'badge-merged' : 
                    activeAudit.status === 'changes_requested' ? 'badge-rejected' : 'badge-review'
                  }`}>
                    {activeAudit.status === 'approved' ? 'Approved' : activeAudit.status === 'changes_requested' ? 'Changes Requested' : 'Pending Review'}
                  </span>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span>Repository: <strong style={{ color: '#f8fafc' }}>{activeAudit.repository}</strong></span>
                  <span>|</span>
                  <span>PR: <strong style={{ color: '#f8fafc' }}>#{activeAudit.pr_number}</strong></span>
                  <span>|</span>
                  <span>Contributor: <strong style={{ color: '#f8fafc' }}>{activeAudit.author}</strong></span>
                  <span>|</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary-teal)', fontWeight: 600 }}>
                    <Shield size={13} /> Assigned Reviewer: Lead AI Auditor
                  </span>
                </div>
              </div>
            </div>

            {/* Before/After Screenshot Slider */}
            <div className="glass-panel slider-container" style={{ marginTop: '24px', padding: '16px' }}>
              <div className="slider-tabs" style={{ marginBottom: '16px' }}>
                <span className="tab-pill before">Before Changes</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Visual Layout Diff Check
                </span>
                <span className="tab-pill after">After Changes</span>
              </div>
              <DiffSlider 
                beforeUrl={activeAudit.before_screenshot_url}
                afterUrl={activeAudit.after_screenshot_url}
                sliderPosition={sliderPosition}
                setSliderPosition={setSliderPosition}
              />
            </div>

            {/* AI Analysis Grid */}
            <div className="detail-grid" style={{ marginTop: '24px' }}>
              {/* Left Side: Summary and Risks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* AI Summary */}
                <div className="glass-panel info-section">
                  <span className="info-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    AI Explanations (Groq Llama-3.3)
                  </span>
                  <ul className="bullet-list" style={{ marginTop: '12px' }}>
                    {activeAudit.ai_summary.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                      <li key={idx} style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '6px' }}>
                        {line.startsWith('*') ? line.substring(1).trim() : line}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* UX Risks */}
                <div className="glass-panel info-section">
                  <span className="info-section-title" style={{ borderLeftColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Visual UX Risks Flagged (Gemini 2.5)
                  </span>
                  <ul className="bullet-list" style={{ marginTop: '12px' }}>
                    {activeAudit.ai_risks.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                      <li 
                        key={idx} 
                        style={{ 
                          fontSize: '13px', 
                          lineHeight: '1.6', 
                          marginBottom: '6px',
                          color: line.includes('High') || line.includes('Risk') ? '#ef4444' : 'var(--text-secondary)' 
                        }}
                      >
                        {line.startsWith('*') ? line.substring(1).trim() : line}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Git diff */}
                <div className="glass-panel info-section">
                  <span className="info-section-title" style={{ borderLeftColor: '#6366f1' }}>Code Patch (git diff)</span>
                  <pre style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '12px', 
                    padding: '16px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '8px', 
                    overflowX: 'auto',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: '#e2e8f0',
                    marginTop: '12px'
                  }}>
                    <code>{activeAudit.git_diff}</code>
                  </pre>
                </div>
              </div>

              {/* Right Side: Feedbacks Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="glass-panel review-panel">
                  <span className="info-section-title">Submit PR Feedback</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
                    Submit single-click status updates to the engineering team.
                  </span>
                  
                  <textarea 
                    className="comment-textarea"
                    placeholder="Add comments (e.g. 'Align buttons', 'Typo fixes needed')..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    style={{ marginTop: '16px', minHeight: '120px' }}
                  />

                  <div className="btn-row" style={{ marginTop: '16px' }}>
                    <button className="btn-approve" onClick={() => handleReviewSubmit('approved')}>
                      Approve Review
                    </button>
                    <button className="btn-changes" onClick={() => handleReviewSubmit('changes_requested')}>
                      Request Changes
                    </button>
                  </div>
                </div>

                {/* Active reviewer comments */}
                {activeAudit.reviewer_comments && (
                  <div className="glass-panel info-section" style={{ borderLeft: '3px solid var(--primary-teal)', padding: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc' }}>
                      <CornerDownRight size={14} /> Reviewer Response
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'block', marginTop: '8px' }}>
                      "{activeAudit.reviewer_comments}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No active audits selected. Select a PR audit from the list.
          </div>
        )}
      </div>
    </div>
  );
}
