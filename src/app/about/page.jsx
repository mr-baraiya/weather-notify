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
        <p className="text-xs text-sky-300 font-bold uppercase tracking-widest mb-5">About</p>

        {/* Hero text */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-r from-sky-200 via-sky-100 to-white bg-clip-text text-transparent">
          Weather alerts,<br />delivered to WhatsApp.
        </h1>
        <p className="text-base sm:text-lg text-sky-100/90 leading-relaxed mb-10 max-w-lg">
          Weather Notify watches the forecast for your city and sends you a message the moment
          conditions change. No apps. No notifications to set up. Just a WhatsApp message when it matters.
        </p>

        <div className="flex items-center gap-5 mb-16">
          <Link href="/" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-900/30">
            Get started
          </Link>
          <Link href="/faq" className="text-sm text-sky-200 hover:text-white transition-colors">
            Read FAQ →
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-12" />

        {/* Why */}
        <div className="mb-12">
          <h2 className="text-xs text-sky-300 uppercase tracking-widest font-bold mb-4 border-l-2 border-sky-400 pl-3 py-0.5">Why we built it</h2>
          <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
            Weather apps are great until you forget to open them. We built Weather Notify because we
            wanted something that worked the other way around — instead of you checking the weather,
            the weather comes to you. One subscription, one message, nothing to remember.
          </p>
        </div>

        {/* What you get — numbered list, no icons */}
        <div>
          <h2 className="text-xs text-sky-300 uppercase tracking-widest font-bold mb-6 border-l-2 border-sky-400 pl-3 py-0.5">What you get</h2>
          <div className="space-y-0 divide-y divide-white/10">
            {what.map((item, i) => (
              <div key={i} className="flex gap-6 py-5">
                <span className="text-xs text-sky-300 font-mono pt-0.5 w-4 shrink-0 font-bold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-base font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-sm text-sky-100/90 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 mb-10" />

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <p className="text-sm text-sky-100/90">Ready to try it?</p>
          <Link href="/" className="text-sm font-semibold text-sky-300 hover:text-white transition-colors">
            Subscribe for free →
          </Link>
        </div>

      </div>
    </div>
  );
}
