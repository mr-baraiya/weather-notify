'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide Navbar header on Admin pages to keep auth portal clean
  if (['/dashboard', '/forgot-password', '/reset-password'].includes(pathname)) {
    return null;
  }

  return (
    <header className="w-full z-50 relative">
      <nav className="container mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold z-20">
          <Sun className="text-yellow-400" />
          <span>Weather Notify</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-indigo-400 transition-colors">About</Link>
          <Link href="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden z-20 text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu Dropdown */}
        <div 
          className={`absolute top-full left-0 w-full bg-[#0f172a] sm:bg-slate-900/95 sm:backdrop-blur-md border-b border-white/10 flex flex-col items-center gap-6 py-8 md:hidden transition-all duration-300 origin-top ${isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}
        >
          <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-indigo-400 transition-colors text-lg">Home</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-indigo-400 transition-colors text-lg">About</Link>
          <Link href="/faq" onClick={() => setIsOpen(false)} className="hover:text-indigo-400 transition-colors text-lg">FAQ</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-indigo-400 transition-colors text-lg">Contact</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
