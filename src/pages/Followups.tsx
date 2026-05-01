import { useState, useEffect } from 'react';
import { FollowUp } from '../types';
import { api } from '../services/api';

const statusColors: Record<string, string> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'secondary',
};

export function Followups() {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFollowups();
  }, []);

  const loadFollowups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.followups.getAll();
      setFollowups(data);
    } catch {
      setError('Failed to load follow-ups. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this follow-up?')) return;
    try {
      await api.followups.delete(id.toString());
      setFollowups(followups.filter((f) => f.id !== id));
    } catch {
      alert('Failed to cancel follow-up');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const groupByDate = (items: FollowUp[]) => {
    const groups: Record<string, FollowUp[]> = {};
    items.forEach((item) => {
      const date = new Date(item.follow_up_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  };

  const grouped = groupByDate(followups.filter((f) => f.status === 'pending'));

  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col">
          <h4>Follow-ups</h4>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={loadFollowups}>
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
      ) : followups.length === 0 ? (
        <div className="alert alert-secondary">No follow-ups scheduled.</div>
      ) : (
        <div className="row">
          {/* Timeline */}
          <div className="col-md-8">
            <h5 className="mb-3">Scheduled Follow-ups</h5>
            {Object.keys(grouped).length === 0 ? (
              <div className="alert alert-secondary">No pending follow-ups.</div>
            ) : (
              Object.entries(grouped)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([date, items]) => (
                  <div key={date} className="mb-4">
                    <div className="border-start border-2 border-primary ps-3">
                      <h6 className="text-primary">{formatDate(items[0].follow_up_at)}</h6>
                      {items.map((item) => (
                        <div className="card mt-2" key={item.id}>
                          <div className="card-body py-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{formatTime(item.follow_up_at)}</strong> - Email ID: {item.email_id}
                                <p className="mb-0 small text-muted">{item.message}</p>
                              </div>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleCancel(item.id)}
                              >
                                <i className="bi bi-x-lg me-1"></i>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* All Follow-ups List */}
          <div className="col-md-4">
            <h5 className="mb-3">All Follow-ups</h5>
            <div className="list-group">
              {followups.map((item) => (
                <div key={item.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <span className={`badge bg-${statusColors[item.status]} mb-1`}>
                        {item.status}
                      </span>
                      <p className="mb-0 small">
                        <strong>Email ID:</strong> {item.email_id}
                      </p>
                      <p className="mb-0 text-muted small">{item.message}</p>
                      <p className="mb-0 text-muted small">
                        {formatDate(item.follow_up_at)} at {formatTime(item.follow_up_at)}
                      </p>
                    </div>
                    {item.status === 'pending' && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancel(item.id)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
