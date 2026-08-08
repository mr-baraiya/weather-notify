import connectToDatabase from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';

// GET /api/admin/messages?search=&category=&page=1&limit=10
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search   = searchParams.get('search')   || '';
    const category = searchParams.get('category') || '';
    const page     = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit    = Math.min(50, parseInt(searchParams.get('limit') || '10'));

    const query = {};
    if (search) query.$or = [
      { name:    { $regex: search, $options: 'i' } },
      { email:   { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
    if (category) query.category = category;

    const [total, messages] = await Promise.all([
      ContactMessage.countDocuments(query),
      ContactMessage.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);

    return Response.json({ success: true, data: { messages, total, page, limit } });
  } catch (e) {
    return Response.json({ success: false, message: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/messages?id=
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID required.' }, { status: 400 });
    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) return Response.json({ success: false, message: 'Message not found.' }, { status: 404 });
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ success: false, message: e.message }, { status: 500 });
  }
}
