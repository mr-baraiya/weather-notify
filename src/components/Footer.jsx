'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();

  // Hide global footer on Admin Dashboard and Auth pages to avoid duplicate footers
  if (['/dashboard', '/forgot-password', '/reset-password'].includes(pathname)) {
    return null;
  }

  return (
    <footer className="w-full border-t border-white/10 bg-black/20 py-8 text-sky-100/80 text-sm mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs sm:text-sm text-sky-100/80">
          &copy; {new Date().getFullYear()} Weather Notify. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <a href="https://github.com/mr-baraiya/weather-notify" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <Link href="/dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
