import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isRunningTriage, setIsRunningTriage] = useState(false);
  const [triageResult, setTriageResult] = useState<string | null>(null);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inbox', icon: 'bi-inbox' },
    { path: '/drafts', label: 'Draft Review', icon: 'bi-pencil-square' },
    { path: '/followups', label: 'Follow-ups', icon: 'bi-calendar-event' },
    { path: '/analytics', label: 'Analytics', icon: 'bi-graph-up' },
  ];

  const handleRunTriage = async () => {
    setIsRunningTriage(true);
    setTriageResult(null);
    try {
      const result = await api.triage.run();
      setTriageResult(`Triage complete: ${result.emails_processed} emails, ${result.drafts_created} drafts, ${result.follow_ups_scheduled} follow-ups`);
    } catch {
      setTriageResult('Failed to run triage. Is the backend running?');
    } finally {
      setIsRunningTriage(false);
    }
  };

  const handleFetchEmails = async () => {
    setIsRunningTriage(true);
    setTriageResult(null);
    try {
      const result = await api.emails.fetch();
      setTriageResult(`Fetched ${result.count} emails from ${result.source}`);
    } catch {
      setTriageResult('Failed to fetch emails. Is the backend running?');
    } finally {
      setIsRunningTriage(false);
    }
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <nav className={`bg-dark text-white ${sidebarCollapsed ? 'col-1' : 'col-2'} transition-all`}>
        <div className="p-3">
          <h4 className={sidebarCollapsed ? 'text-center' : ''}>
            {sidebarCollapsed ? <i className="bi bi-envelope-check"></i> : 'Email Triage'}
          </h4>
        </div>
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link text-white d-flex align-items-center ${location.pathname === item.path ? 'bg-primary' : ''}`}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {!sidebarCollapsed && item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto p-3 border-top border-secondary">
          <button
            className="btn btn-outline-light btn-sm w-100"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="d-flex flex-column flex-grow-1">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-3">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h5">Email Triage Agent</span>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-info text-dark">
                <i className="bi bi-play-circle me-1"></i>
                Demo Mode
              </span>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleFetchEmails}
                disabled={isRunningTriage}
              >
                <i className="bi bi-download me-1"></i>
                Fetch Emails
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRunTriage}
                disabled={isRunningTriage}
              >
                {isRunningTriage ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Running...
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-fill me-1"></i>
                    Run Triage
                  </>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Triage Result Toast */}
        {triageResult && (
          <div className="toast-container position-fixed bottom-0 end-0 p-3">
            <div className={`toast show ${triageResult.includes('Failed') ? 'bg-danger' : 'bg-success'} text-white`}>
              <div className="toast-body d-flex justify-content-between align-items-center">
                {triageResult}
                <button className="btn-close btn-close-white ms-2" onClick={() => setTriageResult(null)}></button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}