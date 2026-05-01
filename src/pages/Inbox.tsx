import { useState, useEffect } from 'react';
import { Email } from '../types';
import { api } from '../services/api';

const priorityColors: Record<string, string> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'secondary',
};

const intentLabels: Record<string, string> = {
  question: 'Question',
  request: 'Request',
  complaint: 'Complaint',
  feedback: 'Feedback',
  newsletter: 'Newsletter',
  other: 'Other',
};

export function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filters, setFilters] = useState({
    priority: '',
    intent: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    loadEmails();
  }, [filters]);

  const loadEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.emails.getAll({
        priority: filters.priority || undefined,
        intent: filters.intent || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });
      setEmails(data);
    } catch {
      setError('Failed to load emails. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col">
          <h4>Inbox</h4>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.intent}
                onChange={(e) => setFilters({ ...filters, intent: e.target.value })}
              >
                <option value="">All Intents</option>
                <option value="question">Question</option>
                <option value="request">Request</option>
                <option value="complaint">Complaint</option>
                <option value="feedback">Feedback</option>
                <option value="newsletter">Newsletter</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="triaged">Triaged</option>
                <option value="actioned">Actioned</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by subject or sender..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={loadEmails}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : emails.length === 0 ? (
        <div className="alert alert-secondary">No emails found matching your criteria.</div>
      ) : (
        <div className="row g-3">
          {emails.map((email) => (
            <div className="col-12" key={email.id}>
              <div
                className={`card ${selectedEmail?.id === email.id ? 'border-primary' : ''}`}
                onClick={() => setSelectedEmail(email)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className={`badge bg-${priorityColors[email.priority]}`}>
                          {email.priority.toUpperCase()}
                        </span>
                        <span className="badge bg-secondary">{intentLabels[email.intent]}</span>
                        <span className={`badge ${email.status === 'new' ? 'bg-success' : 'bg-outline-secondary'}`}>
                          {email.status}
                        </span>
                        {email.hasAttachments && <i className="bi bi-paperclip text-muted"></i>}
                      </div>
                      <h6 className="card-title mb-1">{email.subject}</h6>
                      <p className="text-muted small mb-0">
                        From: {email.sender} &lt;{email.senderEmail}&gt;
                      </p>
                      <p className="text-muted small mb-0">
                        {new Date(email.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="modal show d-block" tabIndex={-1} onClick={() => setSelectedEmail(null)}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedEmail.subject}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedEmail(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>From:</strong> {selectedEmail.sender} &lt;{selectedEmail.senderEmail}&gt;
                </div>
                <div className="mb-3">
                  <strong>To:</strong> {selectedEmail.recipient}
                </div>
                <div className="mb-3">
                  <strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}
                </div>
                <div className="mb-3">
                  <strong>Priority:</strong>
                  <span className={`badge bg-${priorityColors[selectedEmail.priority]} ms-2`}>
                    {selectedEmail.priority.toUpperCase()}
                  </span>
                </div>
                <div className="mb-3">
                  <strong>Intent:</strong> {intentLabels[selectedEmail.intent]}
                </div>
                <div className="mb-3">
                  <strong>Status:</strong> {selectedEmail.status}
                </div>
                {selectedEmail.summary && (
                  <div className="mb-3">
                    <strong>Summary:</strong>
                    <p className="mt-1">{selectedEmail.summary}</p>
                  </div>
                )}
                {selectedEmail.suggestedAction && (
                  <div className="alert alert-info">
                    <strong>Suggested Action:</strong> {selectedEmail.suggestedAction}
                  </div>
                )}
                <hr />
                <div className="mt-3">
                  <strong>Email Body:</strong>
                  <pre className="mt-2 p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedEmail.body}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}