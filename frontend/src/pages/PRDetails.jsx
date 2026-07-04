import React, { useState } from 'react';
import DiffSlider from '../components/DiffSlider';
import { CheckCircle2, AlertTriangle, Shield, User, CornerDownRight, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div 
      className="dashboard-grid" 
      style={{ 
        gridTemplateColumns: isSidebarCollapsed ? '64px 1fr' : '360px 1fr',
        transition: 'grid-template-columns 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        height: 'calc(100vh - 120px)',
        overflow: 'hidden'
      }}
    >
      {/* Left Column: Collapsible List of PR Audits */}
      <div 
        className="sidebar-prs glass-panel" 
        style={{ 
          width: isSidebarCollapsed ? '64px' : '360px',
          height: '100%', 
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sidebar Header with Manual Collapse/Expand Button */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          padding: '16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          minHeight: '53px'
        }}>
          {!isSidebarCollapsed && (
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-teal)' }}>
              Active Audits
            </span>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }}
            className="icon-button"
            style={{ 
              color: 'var(--text-secondary)',
              padding: '4px',
              borderRadius: '6px'
            }}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* PR Audits List */}
        <div className="pr-list" style={{ padding: isSidebarCollapsed ? '8px 4px' : '12px', gap: '8px' }}>
          {audits.length > 0 ? (
            audits.map(audit => {
              const isActive = selectedAuditId === audit.id;
              return (
                <div 
                  key={audit.id} 
                  className={`pr-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedAuditId(audit.id);
                    setIsSidebarCollapsed(true); // Collapse sidebar on click
                  }}
                  title={isSidebarCollapsed ? `${audit.title} (${audit.repository})` : ''}
                  style={{
                    padding: isSidebarCollapsed ? '8px 0' : '14px',
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%'
                  }}
                >
                  {isSidebarCollapsed ? (
                    // Collapsed Avatar view
                    <img 
                      src={`https://images.unsplash.com/photo-${audit.author === 'dev_sarah' ? '1494790108377-be9c29b29330' : '1535713875002-d1d0cf377fde'}?w=100`} 
                      alt="avatar" 
                      className="pr-avatar"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isActive ? '2px solid var(--primary-teal)' : '2px solid transparent',
                        boxShadow: isActive ? '0 0 10px var(--glow-color)' : 'none',
                        margin: 0,
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ) : (
                    // Expanded Detailed list view
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <img 
                        src={`https://images.unsplash.com/photo-${audit.author === 'dev_sarah' ? '1494790108377-be9c29b29330' : '1535713875002-d1d0cf377fde'}?w=100`} 
                        alt="avatar" 
                        className="pr-avatar" 
                      />
                      <div className="pr-details" style={{ width: '100%', overflow: 'hidden' }}>
                        <span className="pr-title" style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block', overflow: 'hidden' }}>
                          {audit.title}
                        </span>
                        <span className="pr-repo" style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block', overflow: 'hidden' }}>
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
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No active pull requests found.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: PR Details & Comparison Report (Scrollable viewport) */}
      <div 
        className="detail-container" 
        style={{ 
          margin: 0, 
          padding: 0,
          height: '100%',
          overflowY: 'auto',
          paddingRight: '8px'
        }}
      >
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

            {/* Before/After Screenshot Slider or Code-Only Summary */}
            <div className="glass-panel slider-container" style={{ marginTop: '24px', padding: '16px' }}>
              {activeAudit.before_screenshot_url && activeAudit.after_screenshot_url ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="slider-tabs" style={{ marginBottom: '16px' }}>
                    <span className="tab-pill before" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8' }}>Code Audit</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Scope of Code-Only Update
                    </span>
                    <span className="tab-pill after" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>No UI</span>
                  </div>
                  
                  <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600 }}>
                        ℹ️ Code-Only Update (No UI layout screenshots attached)
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      This pull request contains backend code, logic modifications, or documentation changes. No UI screenshot diff was attached to the PR.
                    </p>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-teal)', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        MODIFIED FILES ({(() => {
                          if (!activeAudit.git_diff) return 0;
                          return activeAudit.git_diff.split('\n').filter(line => line.startsWith('+++ b/')).length;
                        })()})
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(() => {
                          if (!activeAudit.git_diff) return null;
                          return activeAudit.git_diff.split('\n')
                            .filter(line => line.startsWith('+++ b/'))
                            .map((line, idx) => {
                              const file = line.substring(6).trim();
                              return (
                                <code key={idx} style={{ fontSize: '12px', color: '#cbd5e1', background: 'rgba(0, 0, 0, 0.4)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.03)', width: 'fit-content', fontFamily: 'monospace' }}>
                                  {file}
                                </code>
                              );
                            });
                        })()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Additions: <strong style={{ color: '#10b981' }}>+{(() => {
                        if (!activeAudit.git_diff) return 0;
                        return activeAudit.git_diff.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++')).length;
                      })()} lines</strong></span>
                      <span>Deletions: <strong style={{ color: '#ef4444' }}>-{(() => {
                        if (!activeAudit.git_diff) return 0;
                        return activeAudit.git_diff.split('\n').filter(line => line.startsWith('-') && !line.startsWith('---')).length;
                      })()} lines</strong></span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Stacking sections vertically */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
              {/* AI Summary */}
              <div className="glass-panel info-section" style={{ margin: 0 }}>
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
              <div className="glass-panel info-section" style={{ margin: 0 }}>
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
              <div className="glass-panel info-section" style={{ margin: 0 }}>
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

              {/* Feedbacks Form (Full Width Action Section) */}
              <div className="glass-panel review-panel" style={{ margin: 0 }}>
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

                <div className="btn-row" style={{ marginTop: '16px', display: 'flex', gap: '12px', gridTemplateColumns: 'none' }}>
                  <button className="btn-approve" onClick={() => handleReviewSubmit('approved')} style={{ width: 'auto', minWidth: '150px' }}>
                    Approve Review
                  </button>
                  <button className="btn-changes" onClick={() => handleReviewSubmit('changes_requested')} style={{ width: 'auto', minWidth: '150px' }}>
                    Request Changes
                  </button>
                </div>
              </div>

              {/* Active reviewer comments */}
              {activeAudit.reviewer_comments && (
                <div className="glass-panel info-section" style={{ borderLeft: '3px solid var(--primary-teal)', padding: '16px', margin: 0 }}>
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
        ) : (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No active audits selected. Select a PR audit from the list.
          </div>
        )}
      </div>
    </div>
  );
}
