import connectToDatabase from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    await connectToDatabase();
    const { name, email, category, message } = await request.json();

    // Server-side validation
    if (!name || !email || !category || !message) {
      return new Response(
        JSON.stringify({ success: false, message: 'All fields are required.' }),
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, message: 'Name must be at least 2 characters.' }),
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide a valid email address.' }),
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return new Response(
        JSON.stringify({ success: false, message: 'Message must be at least 10 characters.' }),
        { status: 400 }
      );
    }

    // Save to MongoDB only
    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category: category.trim(),
      message: message.trim(),
    });

    await contactMessage.save();

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully.' }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in /api/contact:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server Error. Please try again later.' }),
      { status: 500 }
    );
  }
}
