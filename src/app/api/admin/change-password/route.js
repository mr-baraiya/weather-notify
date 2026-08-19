import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * POST /api/admin/change-password
 * Body: { currentPassword?: string, newPassword: string, targetAdminId?: string }
 * Allows logged-in admin to change their own password,
 * or allows Main (Seed) admin to change another admin's password.
 */
export async function POST(request) {
  let caller;
  try { caller = verifyAdminRequest(request); }
  catch { return unauthorizedResponse(); }

  try {
    const { currentPassword, newPassword, targetAdminId } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return json({ success: false, message: 'New password must be at least 6 characters long.' }, 400);
    }

    await connectToDatabase();

    const callerAdmin = await AdminUser.findOne({ username: caller.username });
    if (!callerAdmin) {
      return json({ success: false, message: 'Caller admin account not found.' }, 404);
    }

    const callerCb = (callerAdmin?.createdBy || '').toLowerCase();
    const callerUn = (callerAdmin?.username || '').toLowerCase();
    const isMainAdmin = Boolean(callerAdmin) && (callerCb === 'seed' || callerCb === 'system' || callerUn === 'admin');

    // Target admin password change by Main (Seed) Admin
    if (targetAdminId) {
      if (!isMainAdmin) {
        return json({ success: false, message: 'Only the main seed admin can change other admins\' passwords.' }, 403);
      }

      const targetAdmin = await AdminUser.findById(targetAdminId);
      if (!targetAdmin) {
        return json({ success: false, message: 'Target admin account not found.' }, 404);
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      targetAdmin.passwordHash = newHash;
      await targetAdmin.save();

      return json({ success: true, message: `Password for "${targetAdmin.username}" changed successfully!` });
    }

    // Self password change (requires currentPassword verification)
    if (!currentPassword) {
      return json({ success: false, message: 'Current password is required to change your password.' }, 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, callerAdmin.passwordHash);
    if (!isMatch) {
      return json({ success: false, message: 'Current password is incorrect.' }, 400);
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    callerAdmin.passwordHash = newHash;
    await callerAdmin.save();

    return json({ success: true, message: 'Your password was updated successfully!' });
  } catch (err) {
    console.error('POST /api/admin/change-password error:', err);
    return json({ success: false, message: 'Server error.' }, 500);
  }
}
