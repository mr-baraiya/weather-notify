import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sign a JWT for an admin user.
 * @param {string} username
 * @returns {string} signed token (expires in 8h)
 */
export function signAdminToken(username) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
}

/**
 * Verify an admin JWT from a request's Authorization header.
 * Returns the decoded payload or throws.
 * @param {Request} request
 * @returns {{ username: string, role: string }}
 */
export function verifyAdminRequest(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new Error('No token provided.');
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Returns a standard 401 Unauthorized response.
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return new Response(
    JSON.stringify({ success: false, message }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}
