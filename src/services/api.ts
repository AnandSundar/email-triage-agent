import { Email, Draft, FollowUp, Analytics } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_KEY = import.meta.env.VITE_API_KEY;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  priority?: string;
  intent?: string;
  status?: string;
  search?: string;
}

export const api = {
  emails: {
    getAll: (params?: PaginationParams) => {
      const searchParams = new URLSearchParams();
      if (params?.priority) searchParams.set('priority', params.priority);
      if (params?.intent) searchParams.set('intent', params.intent);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));
      const query = searchParams.toString();
      return fetchJson<{ emails: Email[]; pagination: { limit: number; offset: number; total: number } }>(`${API_BASE}/emails${query ? `?${query}` : ''}`).then(res => res.emails);
    },
    getById: (id: string) => fetchJson<Email>(`${API_BASE}/emails/${id}`),
    fetch: () => fetchJson<{ emails: Email[]; count: number; source: string }>(`${API_BASE}/emails/fetch`, { method: 'POST' }),
    getAuthUrl: () => fetchJson<{ auth_url: string }>(`${API_BASE}/emails/auth`),
    callback: (code: string) => fetchJson<{ message: string }>(`${API_BASE}/emails/callback`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  },

  triage: {
    run: () => fetchJson<{ emails_processed: number; drafts_created: number; follow_ups_scheduled: number; duration_seconds: number; errors: string[] }>(`${API_BASE}/triage/run`, { method: 'POST' }),
  },

  drafts: {
    getAll: (params?: PaginationParams) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));
      const query = searchParams.toString();
      return fetchJson<{ drafts: Draft[]; pagination: { limit: number; offset: number; total: number } }>(`${API_BASE}/drafts${query ? `?${query}` : ''}`).then(res => res.drafts);
    },
    update: (id: string, status: 'approved' | 'discarded') =>
      fetchJson<{ draft: Draft }>(`${API_BASE}/drafts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  followups: {
    getAll: (params?: PaginationParams) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));
      const query = searchParams.toString();
      return fetchJson<{ follow_ups: FollowUp[]; pagination: { limit: number; offset: number; total: number } }>(`${API_BASE}/followups${query ? `?${query}` : ''}`).then(res => res.follow_ups);
    },
    delete: (id: string) =>
      fetchJson<{ message: string }>(`${API_BASE}/followups/${id}`, { method: 'DELETE' }),
  },

  analytics: {
    get: () => fetchJson<{ analytics: Analytics }>(`${API_BASE}/analytics`).then(res => res.analytics),
  },
};
