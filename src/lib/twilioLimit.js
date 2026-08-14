import connectToDatabase from '@/lib/mongodb';
import SystemUsage from '@/models/SystemUsage';
import { sendTwilioLimitEmail } from '@/lib/mailer';

const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  try {
    return new Date(d1).toISOString().slice(0, 10) === new Date(d2).toISOString().slice(0, 10);
  } catch {
    return false;
  }
};

/**
 * Tracks system-wide daily Twilio WhatsApp message usage (limit: 50/day).
 * If threshold (50) is reached, sends email alert to SMTP_USER.
 * If count > 50, blocks further outgoing Twilio messages.
 */
export async function trackAndCheckTwilioLimit() {
  try {
    await connectToDatabase();
    const now = new Date();

    let usage = await SystemUsage.findOne({ key: 'global' });
    if (!usage) {
      usage = new SystemUsage({ key: 'global', dailyTwilioCount: 0, lastTwilioResetDate: now, twilioLimitEmailSentToday: false });
    }

    if (!isSameDay(usage.lastTwilioResetDate, now)) {
      usage.dailyTwilioCount = 0;
      usage.lastTwilioResetDate = now;
      usage.twilioLimitEmailSentToday = false;
    }

    if (usage.dailyTwilioCount >= 50) {
      if (!usage.twilioLimitEmailSentToday) {
        usage.twilioLimitEmailSentToday = true;
        await usage.save();
        sendTwilioLimitEmail(process.env.SMTP_USER, usage.dailyTwilioCount)
          .catch((err) => console.error('Failed to send Twilio limit email:', err));
      }
      return { limitReached: true, count: usage.dailyTwilioCount };
    }

    usage.dailyTwilioCount = (usage.dailyTwilioCount || 0) + 1;
    usage.lastTwilioResetDate = now;

    if (usage.dailyTwilioCount >= 50 && !usage.twilioLimitEmailSentToday) {
      usage.twilioLimitEmailSentToday = true;
      sendTwilioLimitEmail(process.env.SMTP_USER, usage.dailyTwilioCount)
        .catch((err) => console.error('Failed to send Twilio limit email:', err));
    }

    await usage.save();
    return { limitReached: false, count: usage.dailyTwilioCount };
  } catch (error) {
    console.error('Error tracking Twilio daily limit:', error);
    return { limitReached: false, count: 0 };
  }
}
