# Weather Notify

A Next.js app that shows live weather data, lets users subscribe with their WhatsApp number, and sends daily weather alerts — automatically, every morning at 6 AM IST.

![Weather Notify](public/README-screenshot.png)

---

## Features

- **Live weather card** — auto-detects your location via geolocation, falls back to a default city
- **WhatsApp subscription** — users enter name, city, and phone number; duplicate number detection built-in
- **Daily alerts at 6 AM IST** — Vercel Cron triggers `/api/send-alert` every morning for all subscribers
- **WhatsApp bot commands** — subscribers can send `WEATHER`, `UPDATE`, `STOP` and more
- **Admin dashboard** — password-protected; manage subscribers (CRUD) and view contact messages
- **Contact form** — with category dropdown, validation, saved to MongoDB
- **FAQ page** — accordion with WhatsApp command reference
- **Google Search Console** — site verification meta tag included
- **Sitemap** — auto-generated at `/sitemap.xml`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Database | MongoDB (Mongoose) |
| Messaging | Twilio WhatsApp API |
| Weather | OpenWeather API |
| HTTP | Axios |
| Hosting | Vercel |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/weather-notify.git
cd weather-notify
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) below for details on each key.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `OPENWEATHER_API_KEY` | From [openweathermap.org](https://openweathermap.org/api) |
| `TWILIO_ACCOUNT_SID` | From Twilio Console |
| `TWILIO_AUTH_TOKEN` | From Twilio Console |
| `TWILIO_WHATSAPP_NUMBER` | Your Twilio sandbox WhatsApp number (e.g. `whatsapp:+14155238886`) |
| `TWILIO_WHATSAPP_JOIN_MESSAGE` | Sandbox join keyword (e.g. `join stand-exclaimed`) |
| `TWILIO_WHATSAPP_SANDBOX_NUMBER` | Sandbox phone number shown to users (e.g. `+1 415 523 8886`) |
| `ADMIN_WHATSAPP_NUMBER` | Your personal WhatsApp number for admin notifications |
| `ADMIN_PASSWORD` | Password to access the admin dashboard at `/dashboard` |
| `CRON_SECRET` | Secret key used to secure `/api/send-alert` from unauthorized triggers |

---

## Admin Dashboard

Visit `/dashboard` — enter your `ADMIN_PASSWORD` to unlock.

- **Users tab** — view, create, edit, delete subscribers; search by name/phone; filter by city
- **Contact Messages tab** — view and delete contact form submissions; filter by category

---

## Automated Daily Alerts (Vercel Cron)

`vercel.json` schedules `/api/send-alert` at `00:30 UTC` = **6:00 AM IST** every day.

```json
{
  "crons": [
    { "path": "/api/send-alert", "schedule": "30 0 * * *" }
  ]
}
```

The route is secured with `CRON_SECRET` — only Vercel's cron runner (which sends the secret as a Bearer token) can trigger it.

---

## WhatsApp Bot Commands

Once connected, subscribers can message the bot:

| Command | Action |
|---|---|
| `WEATHER` | Weather for your saved city |
| `WEATHER <city>` | Weather for any city |
| `UPDATE <name> \| <city>` | Update name and city |
| `UPDATE NAME <name>` | Update name only |
| `UPDATE CITY <city>` | Update city only |
| `STOP` | Unsubscribe and stop all alerts |

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example` in **Project Settings → Environment Variables**
4. Deploy — Vercel cron activates automatically on the Pro plan

> ⚠️ Vercel Cron Jobs require the **Pro plan** or higher.

---

## License

MIT
