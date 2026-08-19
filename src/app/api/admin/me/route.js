import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * GET /api/admin/me
 * Verifies a JWT and returns the logged-in admin's username and isMainAdmin flag.
 * Used on page load to auto-restore session.
 */
export async function GET(request) {
  try {
    const payload = verifyAdminRequest(request);
    await connectToDatabase();
    const admin = await AdminUser.findOne({ username: payload.username });
    const cb = (admin?.createdBy || '').toLowerCase();
    const un = (admin?.username || '').toLowerCase();
    const isMainAdmin = Boolean(admin) && (cb === 'seed' || cb === 'system' || un === 'admin');

    return new Response(
      JSON.stringify({ success: true, username: payload.username, isMainAdmin }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return unauthorizedResponse('Session expired. Please log in again.');
  }
}
