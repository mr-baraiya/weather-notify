# Weather Notify

Weather Notify is a Next.js app that shows live weather data, lets users subscribe with their WhatsApp number, and sends weather alerts for subscribed locations.

## Project Overview

The app combines geolocation, weather lookup, WhatsApp notifications, and an admin dashboard for monitoring subscriber activity and alerts. It is designed for lightweight local development and deployment with MongoDB, OpenWeather, and Twilio.

## Features

- Live weather display on the home page
- WhatsApp subscription form with phone validation
- Geolocation-based calling code detection
- Dashboard for subscriber and alert statistics
- Weather alert cron worker for scheduled checks
- Contact form and WhatsApp webhook endpoints

## Tech Stack

- Next.js 16
- React 19
- MongoDB with Mongoose
- Twilio WhatsApp API
- OpenWeather API
- Tailwind CSS 4
- Axios and node-cron

## Installation Steps

1. Install dependencies with `npm install`.
2. Create a `.env.local` file in the project root.
3. Copy the variables from [.env.example](.env.example) into `.env.local`.
4. Review the required values listed in [docs/ENV.md](docs/ENV.md).
5. Configure your OpenWeather key using [docs/WEATHER_API_KEY.md](docs/WEATHER_API_KEY.md).
6. Configure Twilio WhatsApp credentials using [docs/TWILIO_SETUP.md](docs/TWILIO_SETUP.md).
7. Start the app with `npm run dev`.
8. In a second terminal, run the cron worker with `npm run cron` if you want alerts to process locally.

## Screenshots

![Weather Notify screenshot](public/README-screenshot.png)

Home page screenshot of Weather Notify showing the live weather card and WhatsApp subscription form.

## Documentation

- [.env.example](.env.example)
- [Environment variables](docs/ENV.md)
- [OpenWeather API key](docs/WEATHER_API_KEY.md)
- [Twilio WhatsApp setup](docs/TWILIO_SETUP.md)
- [Cron jobs](docs/CRON.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Contribution guide](CONTRIBUTING.md)
- [Code of conduct](CODE_OF_CONDUCT.md)

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run cron`

## License

MIT. See [LICENSE](LICENSE).
