'use client';

/**
 * Restaurant / open-closed status store. Pulls from `/api/r/:slug/restaurant`
 * and derives isOpen + nextStatusChange on the client, re-checking every minute.
 */

import { create } from 'zustand';
import { isApiError } from '@/lib/api/client';
import { restaurantApi } from '@/lib/api/endpoints';
import type { GoRestaurant } from '@/lib/api/dto';

type DayKey = keyof GoRestaurant['opening_hours'];

const DAY_MAP: Record<number, DayKey> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export type RestaurantStatus = 'open' | 'closed' | 'paused';

type RestaurantState = {
  restaurant: GoRestaurant | null;
  isOpen: boolean;
  status: RestaurantStatus;
  nextStatusChange: string;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  recheck: () => void;
};

function compute(restaurant: GoRestaurant | null): { isOpen: boolean; status: RestaurantStatus; nextStatusChange: string } {
  if (!restaurant) return { isOpen: false, status: 'closed', nextStatusChange: '' };
  if (restaurant.orders_paused) return { isOpen: true, status: 'paused', nextStatusChange: 'Not accepting orders right now' };
  if (restaurant.manual_closed) return { isOpen: false, status: 'closed', nextStatusChange: 'Closed by owner' };

  const now = new Date();
  const currentDay = DAY_MAP[now.getDay()];
  const hours = restaurant.opening_hours[currentDay];
  if (!hours) return { isOpen: false, status: 'closed' as RestaurantStatus, nextStatusChange: '' };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (hours.closed) {
    for (let i = 1; i <= 7; i++) {
      const nextIdx = (now.getDay() + i) % 7;
      const nextHours = restaurant.opening_hours[DAY_MAP[nextIdx]];
      if (nextHours && !nextHours.closed) {
        return { isOpen: false, status: 'closed' as RestaurantStatus, nextStatusChange: `Opens ${dayNames[nextIdx]} at ${nextHours.open}` };
      }
    }
    return { isOpen: false, status: 'closed' as RestaurantStatus, nextStatusChange: '' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMin = timeToMinutes(hours.open);
  const closeMin = timeToMinutes(hours.close);

  if (currentMinutes >= openMin && currentMinutes < closeMin) {
    const closeH = Math.floor(closeMin / 60);
    const closeM = closeMin % 60;
    const period = closeH >= 12 ? 'PM' : 'AM';
    const display = closeH > 12 ? closeH - 12 : closeH;
    return { isOpen: true, status: 'open' as RestaurantStatus, nextStatusChange: `Closes at ${display}:${closeM.toString().padStart(2, '0')} ${period}` };
  }

  if (currentMinutes < openMin) {
    const openH = Math.floor(openMin / 60);
    const openMMin = openMin % 60;
    const period = openH >= 12 ? 'PM' : 'AM';
    const display = openH > 12 ? openH - 12 : openH;
    return { isOpen: false, status: 'closed' as RestaurantStatus, nextStatusChange: `Opens at ${display}:${openMMin.toString().padStart(2, '0')} ${period}` };
  }

  for (let i = 1; i <= 7; i++) {
    const nextIdx = (now.getDay() + i) % 7;
    const nextHours = restaurant.opening_hours[DAY_MAP[nextIdx]];
    if (nextHours && !nextHours.closed) {
      return { isOpen: false, status: 'closed' as RestaurantStatus, nextStatusChange: `Opens ${dayNames[nextIdx]} at ${nextHours.open}` };
    }
  }
  return { isOpen: false, status: 'closed' as RestaurantStatus, nextStatusChange: '' };
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurant: null,
  isOpen: false,
  status: 'closed' as RestaurantStatus,
  nextStatusChange: '',
  loading: false,
  error: null,

  async fetch() {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const restaurant = await restaurantApi.getPublic();
      set({ restaurant, loading: false, ...compute(restaurant) });
    } catch (e) {
      set({ loading: false, error: isApiError(e) ? e.error : 'failed to load restaurant' });
    }
  },

  recheck() {
    set(compute(get().restaurant));
  },
}));
