'use client';

/**
 * Go-backend restaurant status hook. Delegates to the zustand store and
 * returns the shape the UI expects.
 */

import { useEffect } from 'react';
import { useRestaurantStore } from '@/lib/stores/restaurant.store';
import type { RestaurantSettings } from '@/types';

export function useRestaurantStatus() {
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const isOpen = useRestaurantStore((s) => s.isOpen);
  const nextStatusChange = useRestaurantStore((s) => s.nextStatusChange);
  const loading = useRestaurantStore((s) => s.loading);
  const fetchFn = useRestaurantStore((s) => s.fetch);
  const recheck = useRestaurantStore((s) => s.recheck);

  useEffect(() => {
    if (!restaurant && !loading) void fetchFn();
  }, [restaurant, loading, fetchFn]);

  useEffect(() => {
    recheck();
    const t = setInterval(recheck, 60000);
    return () => clearInterval(t);
  }, [recheck]);

  const settings: RestaurantSettings | null = restaurant
    ? {
        id: restaurant.id,
        name: restaurant.name,
        logo_url: restaurant.logo_url ?? null,
        phone: restaurant.phone ?? null,
        delivery_fee: restaurant.delivery_fee,
        min_order_amount: restaurant.min_order_amount,
        estimated_pickup_time: restaurant.estimated_pickup_time,
        estimated_delivery_time: restaurant.estimated_delivery_time,
        currency: restaurant.currency,
        opening_hours: restaurant.opening_hours as unknown as RestaurantSettings['opening_hours'],
        address: restaurant.formatted_address ?? null,
        manual_closed: restaurant.manual_closed,
        created_at: '',
      }
    : null;

  return { settings, isOpen, nextStatusChange, loading };
}
