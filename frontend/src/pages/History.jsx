import React from 'react';
import { Search } from 'lucide-react';

export default function History({
  audits,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  setSelectedAuditId,
  setActiveTab
}) {
  return (
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
              <th className="history-th">Contributor</th>
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
                      <span 
                        className="history-pr-title" 
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => {
                          setSelectedAuditId(audit.id);
                          setActiveTab('prs');
                        }}
                      >
                        #{audit.pr_number}: {audit.title}
                      </span>
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
  );
}
