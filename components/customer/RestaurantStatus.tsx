'use client';

import { motion } from 'framer-motion';
import type { RestaurantStatus as StatusType } from '@/lib/stores/restaurant.store';

interface RestaurantStatusProps {
  isOpen: boolean;
  status: StatusType;
  nextStatusChange: string;
  size?: 'sm' | 'md';
}

const CONFIG: Record<StatusType, {
  dot: string;
  border: string;
  bg: string;
  label: string;
  labelColor: string;
  pulse: boolean;
}> = {
  open: {
    dot: '#3EB489',
    border: 'rgba(62,180,137,0.35)',
    bg: 'rgba(62,180,137,0.10)',
    label: 'Open Now',
    labelColor: '#2E8C68',
    pulse: true,
  },
  paused: {
    dot: '#D4AA6A',
    border: 'rgba(212,170,106,0.4)',
    bg: 'rgba(212,170,106,0.10)',
    label: 'Not Accepting Orders',
    labelColor: '#A07840',
    pulse: false,
  },
  closed: {
    dot: '#EF4444',
    border: 'rgba(239,68,68,0.35)',
    bg: 'rgba(239,68,68,0.10)',
    label: 'Closed',
    labelColor: '#B91C1C',
    pulse: false,
  },
};

export default function RestaurantStatus({
  status,
  nextStatusChange,
  size = 'md',
}: RestaurantStatusProps) {
  const c = CONFIG[status];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border-2 ${
        size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
      }`}
      style={{
        borderColor: c.border,
        backgroundColor: c.bg,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        {c.pulse && (
          <motion.span
            animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: c.dot }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: c.dot }}
        />
      </span>

      {/* Label */}
      <span className="font-semibold" style={{ color: c.labelColor }}>
        {c.label}
      </span>

      {/* Next change hint — omitted for paused since the label says it all */}
      {nextStatusChange && status !== 'paused' && (
        <span style={{ color: '#6B7280' }}>· {nextStatusChange}</span>
      )}
    </div>
  );
}
