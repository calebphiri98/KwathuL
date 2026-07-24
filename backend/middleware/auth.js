import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Reads the "token" httpOnly cookie, verifies it, and attaches req.user
export function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email, role, full_name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

// Use after requireAuth to restrict a route to admins only
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

// Attaches req.user if a valid cookie is present, but does not block the request
export function attachUserIfPresent(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    // ignore invalid token for optional-auth routes
  }
  next();
}
