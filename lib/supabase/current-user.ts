import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export type CurrentProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  default_address: string | null;
};

export type CurrentUser = {
  user: User | null;
  profile: CurrentProfile | null;
  avatarUrl: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnon ||
    supabaseUrl === 'your_supabase_project_url' ||
    supabaseAnon === 'your_supabase_anon_key'
  ) {
    return { user: null, profile: null, avatarUrl: null };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, profile: null, avatarUrl: null };

    const { data: profile } = await supabase
      .from('customer_profiles')
      .select('id, email, full_name, phone, default_address')
      .eq('id', user.id)
      .maybeSingle();

    const avatarUrl =
      (user.user_metadata?.avatar_url as string | undefined) ?? null;

    return { user, profile: profile ?? null, avatarUrl };
  } catch {
    return { user: null, profile: null, avatarUrl: null };
  }
}
