'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { SeedOrder } from '@/types/order';

interface OrderPageProps {
  params: Promise<{ zipCode: string }>;
}

export default function OrderPage({ params }: OrderPageProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId') ?? '';

  const [budget, setBudget] = useState('');
  const [order, setOrder] = useState<SeedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBuildOrder(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!budget || Number(budget) <= 0) {
      setError('Please enter a valid budget amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // params is a Promise in Next.js 15 — resolve it
      const { zipCode } = await params;

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gardenPlanId: planId,
          budget: Number(budget),
          zipCode,
        }),
      });

      if (!res.ok) throw new Error('Order failed');
      const data = await res.json() as SeedOrder;
      setOrder(data);
    } catch {
      setError('Something went wrong building your order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10 max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-stone-900">Your Seed Order</h1>
        <p className="text-stone-500">
          Budget: ${order.budget.toFixed(2)} &middot; Estimated total: ${order.totalEstimated.toFixed(2)}
        </p>

        {order.carts.map((cart) => (
          <div key={cart.supplier.id} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
            <h2 className="font-semibold text-stone-800 text-lg">{cart.supplier.name}</h2>
            <p className="text-stone-500 text-sm">
              {cart.items.length} items &middot; Subtotal: ${cart.subtotal.toFixed(2)}
            </p>
            <ul className="space-y-1">
              {cart.items.map((item, i) => (
                <li key={i} className="text-stone-600 text-sm">&bull; {item.productName}</li>
              ))}
            </ul>
            {cart.status === 'filled' && (
              <a
                href={cart.cartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
              >
                Review &amp; Pay at {cart.supplier.name}
              </a>
            )}
            {cart.status === 'failed' && (
              <p className="text-red-500 text-sm">Could not fill this cart automatically.</p>
            )}
          </div>
        ))}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Order Your Seeds</h1>
        <p className="text-stone-500 mt-1">
          Set your budget. We&apos;ll find the best native seed suppliers and fill your carts.
          You review and press Pay.
        </p>
      </div>

      <form onSubmit={handleBuildOrder} className="space-y-4">
        <div>
          <label htmlFor="budget" className="block text-stone-700 font-medium mb-1.5 text-sm">
            Total budget (USD)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-stone-500 text-lg">$</span>
            <input
              id="budget"
              type="number"
              min="1"
              step="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="100"
              className="flex-1 px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold text-lg transition-colors"
        >
          {loading ? 'Finding seeds and filling carts...' : 'Build My Order'}
        </button>

        <p className="text-stone-400 text-xs text-center">
          We never auto-pay. You review every cart before checkout.
        </p>
      </form>
    </main>
  );
}
