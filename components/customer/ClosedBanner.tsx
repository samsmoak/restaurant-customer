'use client';

import { useRestaurantStore } from '@/lib/stores/restaurant.store';

/**
 * Full-width banner shown at the top of every customer page when the
 * restaurant is currently closed. Disappears automatically once the store
 * opens (the 60s recheck timer in RestaurantProvider drives updates).
 */
export default function ClosedBanner() {
  const isOpen = useRestaurantStore((s) => s.isOpen);
  const nextStatusChange = useRestaurantStore((s) => s.nextStatusChange);
  const loading = useRestaurantStore((s) => s.loading);
  const restaurant = useRestaurantStore((s) => s.restaurant);

  // Don't render until we have confirmed data — avoids a flash on first load.
  if (loading || !restaurant || isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold"
      style={{
        backgroundColor: 'rgba(220, 38, 38, 0.07)',
        borderBottom: '1px solid rgba(220, 38, 38, 0.18)',
        color: '#991B1B',
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: '#EF4444' }}
        aria-hidden
      />
      <span>
        We&apos;re currently closed
        {nextStatusChange ? ` — ${nextStatusChange}` : ''}.
      </span>
      <span style={{ color: '#B91C1C' }}>
        You can still browse the menu, but orders are not being accepted right
        now.
      </span>
    </div>
  );
}
