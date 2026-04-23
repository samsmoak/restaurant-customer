'use client';

import { motion } from 'framer-motion';

interface RestaurantStatusProps {
  isOpen: boolean;
  nextStatusChange: string;
  size?: 'sm' | 'md';
}

export default function RestaurantStatus({
  isOpen,
  nextStatusChange,
  size = 'md',
}: RestaurantStatusProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border-2 ${
        size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
      }`}
      style={{
        borderColor: isOpen ? 'rgba(62, 180, 137, 0.35)' : 'rgba(239, 68, 68, 0.35)',
        backgroundColor: isOpen ? 'rgba(62, 180, 137, 0.12)' : 'rgba(239, 68, 68, 0.10)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Pulsing Dot */}
      <span className="relative flex h-2 w-2">
        {isOpen && (
          <motion.span
            animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: '#3EB489' }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: isOpen ? '#3EB489' : '#EF4444' }}
        />
      </span>

      {/* Status Text */}
      <span className="font-semibold" style={{ color: isOpen ? '#2E8C68' : '#B91C1C' }}>
        {isOpen ? 'Open Now' : 'Closed'}
      </span>
      {nextStatusChange && (
        <span style={{ color: '#4A4A4A' }}>
          · {nextStatusChange}
        </span>
      )}
    </div>
  );
}
