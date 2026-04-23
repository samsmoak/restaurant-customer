'use client';

/**
 * Go-backend order hooks. Admin-style `useOrders()` is not used by the
 * customer app; kept as a thin wrapper for anything that still imports it.
 * `useOrderTracking(orderNumber)` uses the per-order WebSocket stream.
 */

import { useEffect } from 'react';
import { useOrdersStore } from '@/lib/stores/orders.store';
import type { GoOrder, GoOrderStatus } from '@/lib/api/dto';
import type { Order } from '@/types';

function adapt(o: GoOrder): Order {
  return {
    id: o.id,
    order_number: o.order_number,
    status: o.status,
    order_type: o.order_type,
    customer_name: o.customer_name,
    customer_phone: o.customer_phone,
    customer_email: o.customer_email ?? null,
    delivery_address: o.delivery_address ?? null,
    delivery_notes: o.delivery_notes ?? null,
    items: o.items.map((l) => ({
      id: l.id,
      name: l.name,
      quantity: l.quantity,
      base_price: l.base_price,
      selected_size: l.selected_size,
      selected_extras: l.selected_extras,
      special_instructions: l.special_instructions ?? '',
      item_total: l.item_total,
    })),
    subtotal: o.subtotal,
    delivery_fee: o.delivery_fee,
    total: o.total,
    payment_intent_id: o.payment_intent_id ?? null,
    payment_status: o.payment_status,
    special_instructions: o.special_instructions ?? null,
    estimated_ready_time: o.estimated_ready_time ?? null,
    created_at: o.created_at,
  };
}

export function useOrders(_statusFilter?: GoOrderStatus | 'all') {
  const orders = useOrdersStore((s) => s.orders);
  const loading = useOrdersStore((s) => s.loading);
  const fetchMine = useOrdersStore((s) => s.fetchMine);

  useEffect(() => {
    void fetchMine();
  }, [fetchMine]);

  const adapted = orders.map(adapt);
  return {
    orders: adapted,
    loading,
    updateOrderStatus: async () => {
      throw new Error('customers cannot update order status');
    },
    getOrdersByStatus: (status: GoOrderStatus) =>
      adapted.filter((o) => o.status === status),
    getNewOrderCount: () => adapted.filter((o) => o.status === 'new').length,
    refetch: fetchMine,
  };
}

export function useOrderTracking(orderNumber: string | null) {
  const tracked = useOrdersStore((s) => s.tracked);
  const trackingNumber = useOrdersStore((s) => s.trackingNumber);
  const trackOrder = useOrdersStore((s) => s.trackOrder);
  const stopTracking = useOrdersStore((s) => s.stopTracking);

  useEffect(() => {
    if (!orderNumber) return;
    if (trackingNumber !== orderNumber) void trackOrder(orderNumber);
    return () => {
      stopTracking();
    };
  }, [orderNumber, trackingNumber, trackOrder, stopTracking]);

  return {
    order: tracked ? adapt(tracked) : null,
    loading: !tracked && !!orderNumber,
  };
}
