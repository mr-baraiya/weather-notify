import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OfflineBanner from '@/components/OfflineBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Weather Notify – Real-Time Weather Updates & WhatsApp Alerts',
  description: 'Weather Notify provides real-time weather information, forecasts, and weather alerts through WhatsApp. Check temperature, humidity, wind, and forecasts for any city.',
  keywords: 'weather notify, weather updates, live weather, weather forecast, weather alerts, WhatsApp weather alerts, real time weather, weather app, weather notification',
  authors: [{ name: 'Vishal Baraiya' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://weather-notify-tau.vercel.app/',
  },
  openGraph: {
    type: 'website',
    title: 'Weather Notify – Real-Time Weather Updates',
    description: 'Get real-time weather information and weather notifications through WhatsApp.',
    url: 'https://weather-notify-tau.vercel.app/',
    siteName: 'Weather Notify',
    images: [
      {
        url: 'https://weather-notify-tau.vercel.app/og-image.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weather Notify – Real-Time Weather Updates',
    description: 'Check live weather conditions and receive weather updates through WhatsApp.',
    images: ['https://weather-notify-tau.vercel.app/og-image.png'],
  },
  icons: {
    icon: '/weather-icon.webp',
  },
  verification: {
    google: 'awoGcg4dHW-tYhjA9C982UbU6WHYLUY2u0LJCZAngyw',
  },
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Weather Notify",
              "url": "https://weather-notify-tau.vercel.app/",
              "description": "Real-time weather information and WhatsApp weather notifications for cities around the world.",
              "applicationCategory": "WeatherApplication",
              "operatingSystem": "Web",
              "author": {
                "@type": "Person",
                "name": "Vishal Baraiya"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} gradient-bg`}>
        <OfflineBanner />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
