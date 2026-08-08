import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import ContactMessage from '@/models/ContactMessage';

export async function GET(request) {
  // Simple auth check via header (matching how the frontend will call this)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
  }

  try {
    await connectToDatabase();

    // 1. High-level stats
    const totalSubscribers = await Subscriber.countDocuments();
    const totalMessages = await ContactMessage.countDocuments();

    // 2. City Distribution (Top 5)
    const cityAggregation = await Subscriber.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const topCities = cityAggregation.map(c => ({ name: c._id, subscribers: c.count }));

    // 3. Subscriber & Message Growth (Last 14 days)
    // Create an array of the last 14 days formatted as 'MMM DD'
    const growthDataMap = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      growthDataMap[dateString] = { newSubscribers: 0, newMessages: 0 };
    }

    // Find subscribers created in the last 14 days
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentSubscribers = await Subscriber.find({
      createdAt: { $gte: fourteenDaysAgo }
    }).select('createdAt');

    // Count new subscribers per day
    recentSubscribers.forEach(sub => {
      if (sub.createdAt) {
        const dateString = new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (growthDataMap[dateString] !== undefined) {
          growthDataMap[dateString].newSubscribers += 1;
        }
      }
    });

    // Find and count new messages per day
    const recentMessages = await ContactMessage.find({
      createdAt: { $gte: fourteenDaysAgo }
    }).select('createdAt');

    recentMessages.forEach(msg => {
      if (msg.createdAt) {
        const dateString = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (growthDataMap[dateString] !== undefined) {
          growthDataMap[dateString].newMessages += 1;
        }
      }
    });

    // Convert map to array for Recharts
    const growth = Object.keys(growthDataMap).map(date => ({
      date,
      newSubscribers: growthDataMap[date].newSubscribers,
      newMessages: growthDataMap[date].newMessages
    }));

    // If we wanted cumulative growth, we could fetch total before 14 days and add to it.
    // For simplicity, we'll show "New Subscribers" per day in the chart.

    // 4. Messages by Category
    const categoryAggregation = await ContactMessage.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const messagesByCategory = categoryAggregation.map(c => ({ name: c._id, count: c.count }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        totalSubscribers,
        totalMessages,
        topCities,
        growth,
        messagesByCategory
      }
    }), { status: 200 });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
  }
}
