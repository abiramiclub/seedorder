'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) {
      setError('Please enter a valid 5-digit US zip code.');
      return;
    }
    setError('');
    router.push(`/garden/${zip}/report`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-green-950 to-stone-900">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-green-100 tracking-tight">NativeSeed</h1>
          <p className="text-lg text-stone-300">
            Enter your zip code. Get a personalized native plant garden plan
            — with soil data, climate projections, and seeds ordered for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="Enter zip code"
            maxLength={5}
            className="flex-1 px-5 py-3 rounded-xl bg-stone-800 text-stone-100 placeholder-stone-500 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-lg transition-colors"
          >
            Build My Garden
          </button>
        </form>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <p className="text-stone-500 text-sm">
          US only &middot; Powered by USDA, NOAA &amp; Claude AI &middot; Always native plants
        </p>
      </div>
    </main>
  );
}
