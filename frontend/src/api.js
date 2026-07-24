// Centralised fetch wrapper.
// credentials: 'include' is what makes the browser send/receive the
// httpOnly auth cookie set by the backend.

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
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

// Uploads an image file (admin only) and returns { url }.
// Uses multipart/form-data, so it bypasses the JSON-only `request()` helper above.
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BASE_URL}/upload/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Upload failed.');
  return data; // { url: "/uploads/xxx.jpg" }
}

// Resolves a stored image path (e.g. "/uploads/xxx.jpg") to a fully-qualified URL.
// Absolute URLs (http://...) are returned unchanged.
export function resolveImageUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const origin = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '');
  return `${origin}${url}`;
}
