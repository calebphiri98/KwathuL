import crypto from 'crypto';

// Double-submit cookie CSRF protection.
//
// Why this is needed: the auth token cookie is httpOnly (good — JS can't
// read it), but that alone doesn't stop a malicious site from making the
// browser *send* a state-changing request with that cookie attached
// (a classic CSRF attack), especially once NODE_ENV=production switches
// the auth cookie to SameSite=None for cross-origin frontend/backend setups.
//
// The fix: a SECOND cookie holding a random token, readable by JS
// (NOT httpOnly), which the frontend must echo back in a custom request
// header on every state-changing request. A cross-site attacker can force
// the browser to send cookies, but can't read this cookie's value to copy
// it into the header — so forged requests fail.

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function issueCsrfToken(req, res, next) {
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false, // must be readable by frontend JS to echo back in the header
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
  next();
}

export function verifyCsrfToken(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token.' });
  }
  next();
}