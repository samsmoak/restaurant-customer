'use client';

/**
 * Go-backend version of `useMenu`. Adapts `GoCategoryWithItems[]` from the
 * zustand store to the `CategoryWithItems[]` shape the existing UI expects.
 */

import { useEffect } from 'react';
import { useMenuStore } from '@/lib/stores/menu.store';
import type {
  GoCategoryWithItems,
  GoMenuItem,
} from '@/lib/api/dto';
import type {
  Category,
  CategoryWithItems,
  ItemExtra,
  ItemSize,
  MenuItemWithRelations,
} from '@/types';

function adaptItem(item: GoMenuItem): MenuItemWithRelations {
  const sizes: ItemSize[] = (item.sizes ?? []).map((s) => ({
    id: s.id,
    menu_item_id: item.id,
    name: s.name,
    price_modifier: s.price_modifier,
    is_default: s.is_default,
  }));
  const extras: ItemExtra[] = (item.extras ?? []).map((e) => ({
    id: e.id,
    menu_item_id: item.id,
    name: e.name,
    price: e.price,
    is_available: e.is_available,
  }));
  return {
    id: item.id,
    category_id: item.category_id ?? null,
    name: item.name,
    description: item.description ?? null,
    base_price: item.base_price,
    image_url: item.image_url ?? null,
    is_available: item.is_available,
    is_featured: item.is_featured,
    display_order: item.display_order,
    created_at: item.created_at,
    sizes,
    extras,
    category: null,
  };
}

function adaptCategory(cat: GoCategoryWithItems): CategoryWithItems {
  const base: Category = {
    id: cat.id,
    name: cat.name,
    description: cat.description ?? null,
    image_url: cat.image_url ?? null,
    display_order: cat.display_order,
    is_active: cat.is_active,
    created_at: cat.created_at,
  };
  return { ...base, items: (cat.items ?? []).map(adaptItem) };
}

export function useMenu() {
  const categories = useMenuStore((s) => s.categories);
  const loading = useMenuStore((s) => s.loading);
  const loaded = useMenuStore((s) => s.loaded);
  const fetch = useMenuStore((s) => s.fetch);

  useEffect(() => {
    if (!loaded && !loading) void fetch();
  }, [loaded, loading, fetch]);

  const adapted: CategoryWithItems[] = categories.map(adaptCategory);
  const allItems = adapted.flatMap((cat) => cat.items);
  const featuredItems = allItems.filter((item) => item.is_featured && item.is_available);

  return { categories: adapted, allItems, featuredItems, loading };
}
