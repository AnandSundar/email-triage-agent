import { useState, useEffect } from 'react';
import { Draft } from '../types';
import { api } from '../services/api';

export function Drafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [editedBody, setEditedBody] = useState('');

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.drafts.getAll();
      setDrafts(data);
    } catch {
      setError('Failed to load drafts. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.drafts.update(id, 'approved');
      setDrafts(drafts.filter((d) => d.id !== id));
    } catch {
      alert('Failed to approve draft');
    }
  };

  const handleDiscard = async (id: string) => {
    try {
      await api.drafts.update(id, 'discarded');
      setDrafts(drafts.filter((d) => d.id !== id));
    } catch {
      alert('Failed to discard draft');
    }
  };

  const handleEdit = (draft: Draft) => {
    setEditingDraft(draft);
    setEditedBody(draft.body);
  };

  const handleSaveEdit = () => {
    if (editingDraft) {
      setDrafts(
        drafts.map((d) =>
          d.id === editingDraft.id ? { ...d, body: editedBody } : d
        )
      );
      setEditingDraft(null);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col">
          <h4>Draft Review</h4>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={loadDrafts}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : drafts.length === 0 ? (
        <div className="alert alert-secondary">No drafts requiring review.</div>
      ) : (
        <div className="row g-3">
          {drafts.map((draft) => (
            <div className="col-12" key={draft.id}>
              <div className="card">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <div>
                    <span className="badge bg-warning me-2">Pending Review</span>
                    <strong>To:</strong> {draft.original_sender || 'Unknown'}
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleEdit(draft)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(draft.id)}
                    >
                      <i className="bi bi-check-lg me-1"></i>
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDiscard(draft.id)}
                    >
                      <i className="bi bi-x-lg me-1"></i>
                      Discard
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">
                    Re: {draft.original_subject || draft.subject}
                  </h6>
                  <h5 className="card-title">{draft.subject}</h5>
                  <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {draft.body}
                  </p>
                  <small className="text-muted">
                    Created: {new Date(draft.created_at).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingDraft && (
        <div className="modal show d-block" tabIndex={-1} onClick={() => setEditingDraft(null)}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Draft</h5>
                <button type="button" className="btn-close" onClick={() => setEditingDraft(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingDraft.subject}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">To</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingDraft.original_sender || ''}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Body</label>
                  <textarea
                    className="form-control"
                    rows={12}
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditingDraft(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}