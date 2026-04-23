'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Category, MenuItemWithRelations, CategoryWithItems } from '@/types';

export function useMenu() {
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchMenu() {
      // Fetch active categories
      const { data: cats, error: catsError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (catsError) {
        console.error('Error fetching categories:', catsError);
        setLoading(false);
        return;
      }

      // Fetch all available menu items with sizes and extras
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          sizes:item_sizes(*),
          extras:item_extras(*)
        `)
        .order('display_order', { ascending: true });

      if (itemsError) {
        console.error('Error fetching menu items:', itemsError);
        setLoading(false);
        return;
      }

      // Group items by category
      const categoriesWithItems: CategoryWithItems[] = (cats as Category[]).map((cat) => ({
        ...cat,
        items: (items as MenuItemWithRelations[]).filter(
          (item) => item.category_id === cat.id
        ),
      }));

      setCategories(categoriesWithItems);
      setLoading(false);
    }

    fetchMenu();
  }, []);

  const allItems = categories.flatMap((cat) => cat.items);
  const featuredItems = allItems.filter((item) => item.is_featured && item.is_available);

  return { categories, allItems, featuredItems, loading };
}
