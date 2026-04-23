'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { RestaurantSettings, OpeningHours } from '@/types';

type DayKey = keyof OpeningHours;

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
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function useRestaurantStatus() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [nextStatusChange, setNextStatusChange] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(() => {
    if (!settings?.opening_hours) return;

    // Manual override: owner flipped the "closed now" switch.
    if (settings.manual_closed) {
      setIsOpen(false);
      setNextStatusChange('Closed by owner');
      return;
    }

    const now = new Date();
    const currentDay = DAY_MAP[now.getDay()];
    const hours = settings.opening_hours[currentDay];

    if (hours.closed) {
      setIsOpen(false);
      // Find next open day
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (now.getDay() + i) % 7;
        const nextDay = DAY_MAP[nextDayIndex];
        const nextHours = settings.opening_hours[nextDay];
        if (!nextHours.closed) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          setNextStatusChange(`Opens ${dayNames[nextDayIndex]} at ${nextHours.open}`);
          break;
        }
      }
      return;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = timeToMinutes(hours.open);
    const closeMinutes = timeToMinutes(hours.close);

    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      setIsOpen(true);
      const closeHour = Math.floor(closeMinutes / 60);
      const closeMin = closeMinutes % 60;
      const period = closeHour >= 12 ? 'PM' : 'AM';
      const displayHour = closeHour > 12 ? closeHour - 12 : closeHour;
      setNextStatusChange(`Closes at ${displayHour}:${closeMin.toString().padStart(2, '0')} ${period}`);
    } else {
      setIsOpen(false);
      if (currentMinutes < openMinutes) {
        const openHour = Math.floor(openMinutes / 60);
        const openMin = openMinutes % 60;
        const period = openHour >= 12 ? 'PM' : 'AM';
        const displayHour = openHour > 12 ? openHour - 12 : openHour;
        setNextStatusChange(`Opens at ${displayHour}:${openMin.toString().padStart(2, '0')} ${period}`);
      } else {
        // Past closing time, find next open
        for (let i = 1; i <= 7; i++) {
          const nextDayIndex = (now.getDay() + i) % 7;
          const nextDay = DAY_MAP[nextDayIndex];
          const nextHours = settings.opening_hours[nextDay];
          if (!nextHours.closed) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            setNextStatusChange(`Opens ${dayNames[nextDayIndex]} at ${nextHours.open}`);
            break;
          }
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const supabase = createClient();

    async function fetchSettings() {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching restaurant settings:', error);
        setLoading(false);
        return;
      }

      setSettings(data as RestaurantSettings);
      setLoading(false);
    }

    fetchSettings();
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { settings, isOpen, nextStatusChange, loading };
}
