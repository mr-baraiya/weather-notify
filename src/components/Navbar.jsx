import Link from 'next/link';
import { Sun } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="w-full z-10">
      <nav className="container mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
          <Sun className="text-yellow-400" />
          <span>Weather Notify</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-indigo-400 transition-colors">About</Link>
          <Link href="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
