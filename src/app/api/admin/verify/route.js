import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { signAdminToken } from '@/lib/auth';

/**
 * POST /api/admin/verify
 * Body: { username: string, password: string }
 * Returns: { success: true, token: string } on success
 */
export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Username and password are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const input = (username || '').trim().toLowerCase();
    await connectToDatabase();

    const admin = await AdminUser.findOne({
      $or: [{ username: input }, { email: input }],
    });
    if (!admin) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid credentials.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid username or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = signAdminToken(admin.username);

    return new Response(
      JSON.stringify({ success: true, token, username: admin.username }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Login error:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
