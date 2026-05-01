import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { Analytics } from '../types';
import { api } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

export function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analytics.get();
      setAnalytics(data);
    } catch {
      setError('Failed to load analytics. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return <div className="alert alert-danger">{error || 'No data available'}</div>;
  }

  const priorityData = analytics.emails_by_priority || {};
  const intentData = analytics.emails_by_intent || {};
  const statusData = analytics.emails_by_status || {};
  const draftData = analytics.drafts_by_status || {};
  const followUpData = analytics.follow_ups_by_status || {};

  const priorityChartData = {
    labels: ['Urgent', 'High', 'Normal', 'Low'],
    datasets: [
      {
        data: [
          priorityData.urgent || 0,
          priorityData.high || 0,
          priorityData.normal || 0,
          priorityData.low || 0,
        ],
        backgroundColor: ['#dc3545', '#ffc107', '#0dcaf0', '#6c757d'],
      },
    ],
  };

  const intentChartData = {
    labels: Object.keys(intentData),
    datasets: [
      {
        data: Object.values(intentData),
        backgroundColor: ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1', '#20c997', '#17a2b8', '#6610f2'],
      },
    ],
  };

  const statusChartData = {
    labels: ['New', 'Triaged', 'Actioned', 'Archived'],
    datasets: [
      {
        data: [
          statusData.new || 0,
          statusData.triaged || 0,
          statusData.actioned || 0,
          statusData.archived || 0,
        ],
        backgroundColor: ['#198754', '#0dcaf0', '#ffc107', '#6c757d'],
      },
    ],
  };

  const draftStatusChartData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          draftData.pending || 0,
          draftData.approved || 0,
          draftData.rejected || 0,
        ],
        backgroundColor: ['#ffc107', '#198754', '#dc3545'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col">
          <h4>Analytics</h4>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-secondary btn-sm" onClick={loadAnalytics}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{analytics.total_emails}</h3>
              <p className="text-muted mb-0">Total Emails</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning">{analytics.total_drafts}</h3>
              <p className="text-muted mb-0">Total Drafts</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info">{analytics.total_follow_ups}</h3>
              <p className="text-muted mb-0">Follow-ups</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success">{statusData.actioned || 0}</h3>
              <p className="text-muted mb-0">Actioned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-white">
              <h6 className="mb-0">Emails by Priority</h6>
            </div>
            <div className="card-body" style={{ height: '250px' }}>
              <Pie data={priorityChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-white">
              <h6 className="mb-0">Emails by Intent</h6>
            </div>
            <div className="card-body" style={{ height: '250px' }}>
              <Pie data={intentChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-white">
              <h6 className="mb-0">Emails by Status</h6>
            </div>
            <div className="card-body" style={{ height: '250px' }}>
              <Pie data={statusChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-white">
              <h6 className="mb-0">Drafts by Status</h6>
            </div>
            <div className="card-body" style={{ height: '250px' }}>
              <Pie data={draftStatusChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-white">
              <h6 className="mb-0">Follow-ups by Status</h6>
            </div>
            <div className="card-body" style={{ height: '250px' }}>
              <Pie data={{
                labels: ['Pending', 'Completed', 'Cancelled'],
                datasets: [{
                  data: [
                    followUpData.pending || 0,
                    followUpData.completed || 0,
                    followUpData.cancelled || 0,
                  ],
                  backgroundColor: ['#ffc107', '#198754', '#6c757d'],
                }],
              }} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="row g-3 mt-2">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white">
              <h6 className="mb-0">Detailed Breakdown</h6>
            </div>
            <div className="card-body">
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td rowSpan={4}><strong>Priority</strong></td>
                    <td>Urgent</td>
                    <td>{priorityData.urgent || 0}</td>
                  </tr>
                  <tr>
                    <td>High</td>
                    <td>{priorityData.high || 0}</td>
                  </tr>
                  <tr>
                    <td>Normal</td>
                    <td>{priorityData.normal || 0}</td>
                  </tr>
                  <tr>
                    <td>Low</td>
                    <td>{priorityData.low || 0}</td>
                  </tr>
                  <tr>
                    <td rowSpan={Object.keys(intentData).length || 1}><strong>Intent</strong></td>
                    <td>{(Object.keys(intentData)[0] || 'N/A')}</td>
                    <td>{Object.values(intentData)[0] || 0}</td>
                  </tr>
                  {Object.entries(intentData).slice(1).map(([key, value]) => (
                    <tr key={key}><td>{key}</td><td>{value}</td></tr>
                  ))}
                  <tr>
                    <td rowSpan={4}><strong>Status</strong></td>
                    <td>New</td>
                    <td>{statusData.new || 0}</td>
                  </tr>
                  <tr><td>Triaged</td><td>{statusData.triaged || 0}</td></tr>
                  <tr><td>Actioned</td><td>{statusData.actioned || 0}</td></tr>
                  <tr><td>Archived</td><td>{statusData.archived || 0}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
