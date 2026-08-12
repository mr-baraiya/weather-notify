import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';
import { sendContactReplyEmail } from '@/lib/mailer';
import connectToDatabase from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';

/**
 * POST /api/admin/reply-message
 * Body: { messageId?: string, toEmail: string, name: string, category: string, originalMessage: string, replyText: string }
 */
export async function POST(request) {
  try { verifyAdminRequest(request); }
  catch { return unauthorizedResponse(); }

  try {
    const body = await request.json();
    const { messageId, toEmail, name, category, originalMessage, replyText } = body;

    if (!toEmail || !toEmail.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Recipient email address is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!replyText || !replyText.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Reply message cannot be empty.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await sendContactReplyEmail(toEmail.trim(), name, category, originalMessage, replyText.trim());

    // Update ContactMessage status in DB if messageId is provided
    if (messageId) {
      try {
        await connectToDatabase();
        await ContactMessage.findByIdAndUpdate(messageId, {
          isReplied: true,
          repliedAt: new Date(),
        });
      } catch (dbErr) {
        console.error('Error updating isReplied status in DB:', dbErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reply email sent successfully to ${toEmail.trim()}!`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in /api/admin/reply-message:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Failed to send reply email. Check SMTP settings.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
