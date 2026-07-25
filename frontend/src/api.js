const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// CSRF token lives in memory — fetched once from the backend on app load
// and attached manually, since the csrf cookie is cross-origin and can't
// be read via document.cookie from the frontend.
let csrfToken = null;
export function setCsrfToken(token) {
  csrfToken = token;
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const csrfHeaders = {};
  if (!SAFE_METHODS.has(method) && csrfToken) {
    csrfHeaders['x-csrf-token'] = csrfToken;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...csrfHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BASE_URL}/upload/image`, {
    method: 'POST',
    credentials: 'include',
    headers: csrfToken ? { 'x-csrf-token': csrfToken } : undefined,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Upload failed.');
  return data;
}

export function resolveImageUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const origin = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '');
  return `${origin}${url}`;
}