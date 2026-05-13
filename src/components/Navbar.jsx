import Link from 'next/link';
import { Menu, Sun } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="w-full z-10">
      <nav className="container mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
          <Sun className="text-yellow-400" />
          <span>Weather Notify</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-indigo-400 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
          <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
        </div>
        <details className="md:hidden">
          <summary className="cursor-pointer list-none text-gray-300">
            <Menu className="h-5 w-5" />
          </summary>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
            <Link href="/about" className="hover:text-indigo-400 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
          </div>
        </details>
      </nav>
    </header>
  );
};

export default Navbar;
