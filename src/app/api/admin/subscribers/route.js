import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

// GET /api/admin/subscribers?search=&city=&page=1&limit=10
export async function GET(request) {
  try { verifyAdminRequest(request); } catch { return unauthorizedResponse(); }
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const city   = searchParams.get('city')   || '';
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit  = Math.min(50, parseInt(searchParams.get('limit') || '10'));

    const query = {};
    if (search) query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    if (city) query.city = { $regex: city, $options: 'i' };

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
  try { verifyAdminRequest(request); } catch { return unauthorizedResponse(); }
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, city, phone } = body;
    if (!name || !city || !phone) return Response.json({ success: false, message: 'All fields required.' }, { status: 400 });
    const sub = await Subscriber.create({ name: name.trim(), city: city.trim(), phone: phone.trim() });
    return Response.json({ success: true, data: sub }, { status: 201 });
  } catch (e) {
    const msg = e.code === 11000 ? 'Phone number already exists.' : e.message;
    return Response.json({ success: false, message: msg }, { status: 400 });
  }
}

// PUT /api/admin/subscribers  — update by id
export async function PUT(request) {
  try { verifyAdminRequest(request); } catch { return unauthorizedResponse(); }
  try {
    await connectToDatabase();
    const { id, name, city, phone } = await request.json();
    if (!id) return Response.json({ success: false, message: 'ID required.' }, { status: 400 });
    const updated = await Subscriber.findByIdAndUpdate(id, { name, city, phone }, { new: true, runValidators: true });
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
