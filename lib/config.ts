/**
 * Single source of truth for deployment-level config read from env vars.
 * All files that need the restaurant ID import RESTAURANT_ID from here —
 * nothing else should call process.env.NEXT_PUBLIC_RESTAURANT_ID directly.
 */

export const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID ?? '';
