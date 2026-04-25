'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRestaurantStore } from '@/lib/stores/restaurant.store';

/**
 * Mounted once in the customer layout. Kicks off the restaurant fetch and the
 * 60-second open/closed recheck timer so every page has fresh data without
 * each page having to manage it themselves.
 *
 * If the fetch fails (wrong restaurant ID, backend down) we replace the entire
 * page content with a clear error rather than letting pages crash silently.
 */
export default function RestaurantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetch = useRestaurantStore((s) => s.fetch);
  const recheck = useRestaurantStore((s) => s.recheck);
  const loading = useRestaurantStore((s) => s.loading);
  const error = useRestaurantStore((s) => s.error);
  const restaurant = useRestaurantStore((s) => s.restaurant);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  useEffect(() => {
    recheck();
    const t = setInterval(recheck, 60_000);
    return () => clearInterval(t);
  }, [recheck]);

  // Only surface the error page once loading has settled and we have no data.
  if (!loading && error && !restaurant) {
    return <StoreUnavailable />;
  }

  return <>{children}</>;
}

function StoreUnavailable() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6"
        style={{
          background: 'linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)',
          color: '#FFFFFF',
        }}
      >
        !
      </div>
      <h1
        className="text-3xl font-bold mb-3"
        style={{ fontFamily: 'var(--font-playfair)', color: '#1A1A1A' }}
      >
        This store is not available
      </h1>
      <p className="text-base max-w-sm" style={{ color: '#4A4A4A' }}>
        We couldn&apos;t load the restaurant. Please check back later or contact
        support if the problem persists.
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)',
          color: '#FFFFFF',
          boxShadow: '0 6px 18px rgba(255,90,60,0.28)',
        }}
      >
        Go home
      </Link>
    </div>
  );
}
