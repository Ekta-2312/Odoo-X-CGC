export const API_BASE = 'http://localhost:5000';

const json = (res: Response) => res.json();

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
    if (!res.ok) throw new Error((await res.text()) || 'Request failed');
    return json(res);
  },
  patch: async (path: string, body?: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.text()) || 'Request failed');
    return json(res);
  },
  post: async (path: string, body?: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.text()) || 'Request failed');
    return json(res);
  },
  put: async (path: string, body?: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.text()) || 'Request failed');
    return json(res);
  },
  delete: async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Request failed');
    return json(res);
  },
};
