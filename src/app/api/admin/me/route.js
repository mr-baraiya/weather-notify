import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * GET /api/admin/me
 * Verifies a JWT and returns the logged-in admin's username.
 * Used on page load to auto-restore session.
 */
export async function GET(request) {
  try {
    const payload = verifyAdminRequest(request);
    return new Response(
      JSON.stringify({ success: true, username: payload.username }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return unauthorizedResponse('Session expired. Please log in again.');
  }
}
