import React from 'react';

export default function PRDetails({
  activeAudit,
  reviewComments,
  setReviewComments,
  handleReviewSubmit
}) {
  return (
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
  );
}
