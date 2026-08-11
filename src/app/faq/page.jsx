'use client';
import { useState } from 'react';

const faqs = [
  {
    question: 'What WhatsApp commands can I use?',
    answer: (
      <div className="space-y-4">
        <p className="text-sm text-sky-100/90 leading-relaxed">
          Once connected, you can interact with the bot by sending the commands below exactly as shown.
        </p>
        <div className="space-y-0 divide-y divide-white/10">
          {[
            { cmd: 'WEATHER', desc: 'Get weather for your saved city' },
            { cmd: 'WEATHER <city>', desc: 'Get weather for any specific city' },
            { cmd: 'UPDATE <name> | <city>', desc: 'Update your name and city together' },
            { cmd: 'UPDATE NAME <name>', desc: 'Update only your name' },
            { cmd: 'UPDATE CITY <city>', desc: 'Update only your city' },
            { cmd: 'STOP', desc: 'Delete your subscription and stop all alerts' },
          ].map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-start gap-4 py-3">
              <code
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)' }}
                className="text-xs text-sky-200 font-mono px-2 py-1 rounded shrink-0 mt-0.5 break-all max-w-full"
              >
                {cmd}
              </code>
              <p className="text-sm text-sky-100/90">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-sky-200/80">
          If you send an unrecognised message, the bot will reply with a list of available commands.
        </p>
      </div>
    ),
  },
  {
    question: 'How do I connect my WhatsApp manually?',
    answer: (
      <div className="space-y-3">
        <p className="text-sm text-sky-100/90 leading-relaxed">
          If the QR code or direct link doesn't work, open WhatsApp and send this message manually:
        </p>
        <div className="space-y-2">
          <div
            style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
            className="rounded-lg px-4 py-3"
          >
            <p className="text-[10px] uppercase tracking-wider text-sky-200/80 mb-1">Send this message</p>
            <p className="font-mono text-sm text-emerald-400 font-semibold">join stand-exclaimed</p>
          </div>
          <div
            style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
            className="rounded-lg px-4 py-3"
          >
            <p className="text-[10px] uppercase tracking-wider text-sky-200/80 mb-1">To this number</p>
            <p className="font-mono text-sm text-sky-300 font-semibold">+1 415 523 8886</p>
          </div>
        </div>
        <p className="text-xs text-sky-200/80">You'll get an automated confirmation reply once connected.</p>
      </div>
    ),
  },
  {
    question: 'How does Weather Notify work?',
    answer: 'Weather Notify tracks real-time weather forecasts for your subscribed city and sends automated alerts directly to your WhatsApp when rain, heatwaves, or severe weather changes occur.',
  },
  {
    question: 'Is Weather Notify free to use?',
    answer: 'Yes. Subscribing and receiving WhatsApp weather updates is completely free.',
  },
  {
    question: 'How do I stop alerts?',
    answer: 'Send STOP in WhatsApp at any time to unsubscribe and stop all notifications immediately.',
  },
  {
    question: 'Can I check weather for other cities?',
    answer: 'Yes. Send "WEATHER <city>" (e.g. WEATHER London) in WhatsApp to get live weather for any location worldwide.',
  },
  {
    question: 'Which cities are supported?',
    answer: 'All major cities globally via OpenWeather real-time data.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen py-16 sm:py-24 px-4 text-white">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <p className="text-xs text-sky-300 font-bold uppercase tracking-widest mb-5">FAQ</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Frequently asked questions
        </h1>
        <p className="text-sm sm:text-base text-sky-100/90 mb-12 leading-relaxed">
          Everything you need to know about setting up and using Weather Notify on WhatsApp.
        </p>

        {/* Accordion — divider style, no cards */}
        <div className="divide-y divide-white/10">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-5 flex items-center justify-between gap-6 text-left focus:outline-none group"
                >
                  <span className={`text-base font-semibold transition-colors ${isOpen ? 'text-white' : 'text-sky-100/90 group-hover:text-white'}`}>
                    {faq.question}
                  </span>
                  <span className={`shrink-0 text-xl leading-none text-sky-300 transition-transform duration-200 select-none ${isOpen ? 'rotate-45 text-sky-200' : ''}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-6 text-sm sm:text-base text-sky-100/85 leading-relaxed">
                    {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
