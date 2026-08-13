import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

// GET /api/admin/subscribers?search=&city=&status=&page=1&limit=10
export async function GET(request) {
  try { verifyAdminRequest(request); } catch { return unauthorizedResponse(); }
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const city   = searchParams.get('city')   || '';
    const status = searchParams.get('status') || '';
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit  = Math.min(50, parseInt(searchParams.get('limit') || '10'));

    const query = {};
    if (search) query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (city) query.city = { $regex: city, $options: 'i' };
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const [total, subscribers] = await Promise.all([
      Subscriber.countDocuments(query),
      Subscriber.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);

    return Response.json({ success: true, data: { subscribers, total, page, limit } });
  } catch (e) {
    return Response.json({ success: false, message: e.message }, { status: 500 });
  }
}

// POST /api/admin/subscribers  — create
export async function POST(request) {
  let adminUsername = 'Admin';
  try {
    const admin = verifyAdminRequest(request);
    if (admin?.username) adminUsername = admin.username;
  } catch { return unauthorizedResponse(); }

  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, city, phone, isActive = true } = body;
    if (!name || !city || !phone || !email) {
      return Response.json({ success: false, message: 'All fields (name, email, city, phone) are required.' }, { status: 400 });
    }
    const sub = await Subscriber.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      city: city.trim(),
      phone: phone.trim(),
      isActive: Boolean(isActive),
      createdBy: adminUsername,
      updatedBy: adminUsername,
    });
    return Response.json({ success: true, data: sub }, { status: 201 });
  } catch (e) {
    const msg = e.code === 11000 ? 'Phone number already exists.' : e.message;
    return Response.json({ success: false, message: msg }, { status: 400 });
  }
}

// PUT /api/admin/subscribers  — update by id
export async function PUT(request) {
  let adminUsername = 'Admin';
  try {
    const admin = verifyAdminRequest(request);
    if (admin?.username) adminUsername = admin.username;
  } catch { return unauthorizedResponse(); }

  try {
    await connectToDatabase();
    const { id, name, email, city, phone, isActive } = await request.json();
    if (!id) return Response.json({ success: false, message: 'ID required.' }, { status: 400 });

    const updateFields = { updatedBy: adminUsername, updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name.trim();
    if (email !== undefined) updateFields.email = email.trim().toLowerCase();
    if (city !== undefined) updateFields.city = city.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive);

    const updated = await Subscriber.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    if (!updated) return Response.json({ success: false, message: 'Subscriber not found.' }, { status: 404 });
    return Response.json({ success: true, data: updated });
  } catch (e) {
    return Response.json({ success: false, message: e.message }, { status: 400 });
  }
}

// DELETE /api/admin/subscribers?id=
export async function DELETE(request) {
  try { verifyAdminRequest(request); } catch { return unauthorizedResponse(); }
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID required.' }, { status: 400 });
    const deleted = await Subscriber.findByIdAndDelete(id);
    if (!deleted) return Response.json({ success: false, message: 'Subscriber not found.' }, { status: 404 });
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ success: false, message: e.message }, { status: 500 });
  }
}
