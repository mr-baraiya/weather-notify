import Link from 'next/link';
import { Sun } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="w-full z-10">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
          <Sun className="text-yellow-400" />
          <span>Weather Notify</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-indigo-400 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
          <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
