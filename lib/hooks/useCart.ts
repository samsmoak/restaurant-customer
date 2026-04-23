'use client';

/**
 * Go-backend cart. Backend-agnostic shape (same interface as before) — just
 * re-exports the zustand store from lib/stores/cart.store.ts so existing
 * components keep working.
 */

export { useCartStore as useCart } from '@/lib/stores/cart.store';
