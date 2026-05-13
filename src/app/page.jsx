import Hero from '@/components/Hero';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full opacity-30 translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      <Hero />
    </div>
  );
}
