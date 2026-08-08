'use client';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink } from 'lucide-react';

const WhatsAppModal = ({ setup, onClose }) => {
  if (!setup) return null;

  const sanitizeNumber = (num) => (num ? num.replace(/[^\d+]/g, '') : '');
  const cleanNumber = sanitizeNumber(setup.sandboxNumber);
  const rawNumberNoPlus = cleanNumber.replace('+', '');
  const joinMessage = setup.joinMessage || 'join stand-exclaimed';
  const waUrl = `https://wa.me/${rawNumberNoPlus}?text=${encodeURIComponent(joinMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        style={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.08)' }}
        className="relative w-full max-w-sm rounded-2xl p-8 shadow-2xl text-white"
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-300 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Connect WhatsApp</h2>
          <p className="text-sm text-gray-500 mt-1">
            Scan with your phone or tap the link below.
          </p>
        </div>

        {/* QR Code — centered, clean */}
        <div className="flex flex-col items-center mb-6">
          <div
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}
            className="rounded-xl p-4"
          >
            <Image
              src="/qr.png"
              alt="Scan to connect WhatsApp"
              width={176}
              height={176}
              priority
              className="rounded-lg block"
            />
          </div>
          <p className="text-xs text-gray-600 mt-3 tracking-wide">
            Open your camera app and point at the code
          </p>
        </div>

        {/* Divider with OR */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/6" />
          <span className="text-[11px] text-gray-600 font-medium tracking-wider uppercase">or</span>
          <div className="flex-1 h-px bg-white/6" />
        </div>

        {/* WhatsApp direct link */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
          style={{ background: '#25D366', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1ebd5b'}
          onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
        >
          Open in WhatsApp
          <ExternalLink size={14} />
        </a>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-5">
          <Link
            href="/faq"
            target="_blank"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Need help? FAQ →
          </Link>
          <button
            onClick={onClose}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Done, I'm connected
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
