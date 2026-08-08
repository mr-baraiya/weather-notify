import Link from 'next/link';

const what = [
  {
    label: 'Instant alerts',
    desc: 'Know about rain, heatwaves, or severe weather before it hits — not after.',
  },
  {
    label: 'WhatsApp native',
    desc: 'No app to install, no dashboard to check. Alerts arrive where you already are.',
  },
  {
    label: 'Any city, worldwide',
    desc: 'Powered by OpenWeather. Works for any major city across the globe.',
  },
  {
    label: 'Set and forget',
    desc: 'Subscribe once. We handle everything else — monitoring, triggering, sending.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 sm:py-24 px-4 text-white">
      <div className="max-w-2xl mx-auto">

        {/* Eyebrow */}
        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-5">About</p>

        {/* Hero text */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          Weather alerts,<br />delivered to WhatsApp.
        </h1>
        <p className="text-base text-gray-500 leading-relaxed mb-10 max-w-lg">
          Weather Notify watches the forecast for your city and sends you a message the moment
          conditions change. No apps. No notifications to set up. Just a WhatsApp message when it matters.
        </p>

        <div className="flex items-center gap-5 mb-16">
          <Link href="/" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors">
            Get started
          </Link>
          <Link href="/faq" className="text-sm text-gray-500 hover:text-white transition-colors">
            Read FAQ →
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-white/6 mb-12" />

        {/* Why */}
        <div className="mb-12">
          <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Why we built it</h2>
          <p className="text-sm text-gray-500 leading-7">
            Weather apps are great until you forget to open them. We built Weather Notify because we
            wanted something that worked the other way around — instead of you checking the weather,
            the weather comes to you. One subscription, one message, nothing to remember.
          </p>
        </div>

        {/* What you get — numbered list, no icons */}
        <div>
          <h2 className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-6">What you get</h2>
          <div className="space-y-0 divide-y divide-white/5">
            {what.map((item, i) => (
              <div key={i} className="flex gap-6 py-5">
                <span className="text-xs text-gray-700 font-mono pt-0.5 w-4 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/6 mt-12 mb-10" />

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <p className="text-sm text-gray-500">Ready to try it?</p>
          <Link href="/" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Subscribe for free →
          </Link>
        </div>

      </div>
    </div>
  );
}
