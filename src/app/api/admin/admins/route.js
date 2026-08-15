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
 * GET /api/admin/admins
 * Returns list of all admin accounts (no password hashes).
 */
export async function GET(request) {
  try { verifyAdminRequest(request); }
  catch { return unauthorizedResponse(); }

  try {
    await connectToDatabase();
    const admins = await AdminUser.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
    return json({ success: true, data: admins });
  } catch (err) {
    console.error('GET /admin/admins error:', err);
    return json({ success: false, message: 'Server error.' }, 500);
  }
}

/**
 * POST /api/admin/admins
 * Body: { username: string, password: string }
 * Creates a new admin account.
 */
export async function POST(request) {
  let caller;
  try { caller = verifyAdminRequest(request); }
  catch { return unauthorizedResponse(); }

  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return json({ success: false, message: 'Username, email, and password are required.' }, 400);
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return json({ success: false, message: 'Please provide a valid email address.' }, 400);
    }
    if (password.length < 6) {
      return json({ success: false, message: 'Password must be at least 6 characters.' }, 400);
    }

    await connectToDatabase();

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const exists = await AdminUser.findOne({ username: cleanUsername });
    if (exists) {
      return json({ success: false, message: 'Username already exists.' }, 409);
    }

    if (cleanEmail) {
      const emailExists = await AdminUser.findOne({ email: cleanEmail });
      if (emailExists) {
        return json({ success: false, message: 'Email already exists.' }, 409);
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newAdmin = await AdminUser.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      createdBy: caller.username,
    });

    return json(
      { success: true, data: { _id: newAdmin._id, username: newAdmin.username, email: newAdmin.email, createdAt: newAdmin.createdAt } },
      201
    );
  } catch (err) {
    console.error('POST /admin/admins error:', err);
    return json({ success: false, message: 'Server error.' }, 500);
  }
}

/**
 * DELETE /api/admin/admins?id=<adminId>
 * Deletes an admin account. Cannot delete yourself.
 */
export async function DELETE(request) {
  let caller;
  try { caller = verifyAdminRequest(request); }
  catch { return unauthorizedResponse(); }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return json({ success: false, message: 'ID is required.' }, 400);

    await connectToDatabase();

    const target = await AdminUser.findById(id);
    if (!target) return json({ success: false, message: 'Admin not found.' }, 404);

    if (target.username === caller.username) {
      return json({ success: false, message: 'You cannot delete your own account.' }, 403);
    }

    await AdminUser.findByIdAndDelete(id);
    return json({ success: true });
  } catch (err) {
    console.error('DELETE /admin/admins error:', err);
    return json({ success: false, message: 'Server error.' }, 500);
  }
}
