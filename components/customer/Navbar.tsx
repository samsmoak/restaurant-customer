'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/lib/hooks/useCart';
import { hydrateCart } from '@/lib/stores/cart.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useRestaurantStore } from '@/lib/stores/restaurant.store';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  // Only the homepage has a dark hero — on all other pages, always show the
  // frosted light navbar so text is legible against the white page background.
  const hasHero = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // `mounted` flag: persisted zustand stores (cart, auth) differ between
  // SSR and the first client paint because localStorage is only available
  // after mount. Gate any value that reads from those stores so SSR markup
  // matches the initial client render.
  const [mounted, setMounted] = useState(false);

  const rawItemCount = useCart((s) => s.getItemCount());
  const itemCount = mounted ? rawItemCount : 0;

  const hydrate = useAuthStore((s) => s.hydrate);
  const rawToken = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const fetchProfile = useProfileStore((s) => s.fetch);
  const signout = useAuthStore((s) => s.signout);
  const restaurant = useRestaurantStore((s) => s.restaurant);

  const token = mounted ? rawToken : null;
  const signedIn = !!token;

  useEffect(() => {
    // Sync both persisted stores from localStorage, then flip `mounted` so
    // the UI can render the real (signed-in) state without an SSR mismatch.
    hydrate();
    hydrateCart();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (signedIn && !profile) void fetchProfile();
  }, [signedIn, profile, fetchProfile]);

  useEffect(() => {
    // Check initial scroll position (e.g. user refreshed while scrolled down)
    setScrolled(window.scrollY > 50);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signout();
    router.push('/');
    router.refresh();
  };

  const email = profile?.email ?? user?.email ?? null;
  const fullName = profile?.full_name ?? user?.full_name ?? null;

  // showDark: true when the navbar has a light frosted background (needs dark text)
  // false when floating over the dark hero (needs white text)
  const showDark   = !hasHero || scrolled;
  const textColor  = showDark ? '#1A1A1A' : '#FFFFFF';
  const textMuted  = showDark ? 'rgba(26,26,26,0.6)' : 'rgba(255,255,255,0.7)';
  const iconAccent = showDark ? '#C9A96E' : '#EDD07A';
  const colorTransition = 'color 0.3s ease';

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: showDark ? 'rgba(255, 255, 255, 0.92)' : 'transparent',
          backdropFilter: showDark ? 'blur(20px)' : 'none',
          borderBottom: showDark ? '1px solid rgba(26, 26, 26, 0.07)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {restaurant?.logo_url ? (
              <Image
                src={restaurant.logo_url}
                alt={restaurant.name}
                width={32}
                height={32}
                className="rounded-lg object-cover transition-transform group-hover:scale-105"
                style={{ boxShadow: '0 3px 12px rgba(201,169,110,0.35)' }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #D4AA6A 0%, #9A6E30 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 3px 12px rgba(201,169,110,0.35)',
                }}
              >
                {restaurant ? restaurant.name.slice(0, 2).toUpperCase() : '…'}
              </div>
            )}
            <span
              className="text-base font-semibold hidden sm:block"
              style={{ color: textColor, fontFamily: 'var(--font-playfair)', transition: colorTransition }}
            >
              {restaurant?.name ?? ''}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/menu"
              className="text-sm font-medium hover:opacity-100"
              style={{ color: textMuted, transition: colorTransition }}
            >
              Menu
            </Link>
            <Link
              href="/track"
              className="text-sm font-medium hover:opacity-100"
              style={{ color: textMuted, transition: colorTransition }}
            >
              Track Order
            </Link>
            {!signedIn && (
              <Link
                href="/join"
                className="text-sm font-medium hover:opacity-100"
                style={{ color: textMuted, transition: colorTransition }}
              >
                Sign Up
              </Link>
            )}

            {signedIn && (
              <ProfileDropdown
                fullName={fullName}
                email={email}
                onSignOut={handleSignOut}
                showDark={showDark}
                iconAccent={iconAccent}
              />
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #D4AA6A 0%, #9A6E30 100%)',
                color: '#FFF8EE',
                boxShadow: scrolled
                  ? '0 4px 14px rgba(154,110,48,0.28)'
                  : '0 4px 14px rgba(0,0,0,0.35)',
              }}
            >
              <ShoppingBag size={15} />
              <span>Cart</span>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#0A0805', color: '#EDD07A' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
          </nav>

          {/* Mobile right side */}
          <div className="flex items-center gap-3.5 md:hidden">
            <Link href="/cart" className="relative" style={{ color: iconAccent, transition: colorTransition }}>
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#0A0805', color: '#EDD07A' }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(true)} style={{ color: textColor, transition: colorTransition }}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            signedIn={signedIn}
            fullName={fullName}
            email={email}
            itemCount={itemCount}
            onClose={() => setMobileOpen(false)}
            onSignOut={handleSignOut}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Profile dropdown (desktop) ── */

function ProfileDropdown({
  fullName,
  email,
  onSignOut,
  showDark,
  iconAccent,
}: {
  fullName: string | null;
  email: string | null;
  onSignOut: () => void;
  showDark: boolean;
  iconAccent: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName =
    fullName?.split(' ')[0] ||
    email?.split('@')[0] ||
    'Account';

  const initials = fullName
    ? fullName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : (email?.[0] ?? 'U').toUpperCase();

  const triggerBg      = showDark ? 'rgba(26,26,26,0.06)' : 'rgba(255,255,255,0.14)';
  const triggerText    = showDark ? '#1A1A1A' : '#FFFFFF';
  const triggerChevron = showDark ? '#6B7280' : 'rgba(255,255,255,0.7)';
  const colorTransition = 'color 0.3s ease, background-color 0.3s ease';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full px-2 py-1 hover:scale-105"
        style={{ backgroundColor: triggerBg, transition: colorTransition }}
      >
        <Avatar initials={initials} size={28} />
        <span
          className="text-sm font-medium max-w-22.5 truncate"
          style={{ color: triggerText, transition: colorTransition }}
        >
          {displayName}
        </span>
        <ChevronDown
          size={13}
          style={{
            color: triggerChevron,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease, color 0.3s ease',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(26,26,26,0.09)',
              zIndex: 100,
            }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2.5"
              style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
            >
              <Avatar initials={initials} size={32} />
              <div className="min-w-0">
                {fullName && (
                  <p className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>
                    {fullName}
                  </p>
                )}
                <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                  {email}
                </p>
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => { setOpen(false); router.push('/orders'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-stone-50"
                style={{ color: '#1A1A1A' }}
              >
                <ClipboardList size={14} style={{ color: iconAccent }} />
                My Orders
              </button>
              <button
                onClick={() => { setOpen(false); router.push('/profile'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-stone-50"
                style={{ color: '#1A1A1A' }}
              >
                <User size={14} style={{ color: iconAccent }} />
                My Profile
              </button>
            </div>

            <div style={{ borderTop: '1px solid rgba(26,26,26,0.07)' }} className="py-1">
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-50"
                style={{ color: '#DC2626' }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Avatar ── */

function Avatar({ initials, size }: { initials: string; size: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size < 32 ? 10 : 12,
        background: 'linear-gradient(135deg, #D4AA6A 0%, #9A6E30 100%)',
        color: '#FFF8EE',
      }}
    >
      {initials}
    </div>
  );
}

/* ── Mobile menu ── */

function MobileMenu({
  signedIn,
  fullName,
  email,
  itemCount,
  onClose,
  onSignOut,
}: {
  signedIn: boolean;
  fullName: string | null;
  email: string | null;
  itemCount: number;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const router = useRouter();

  const initials = fullName
    ? fullName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : (email?.[0] ?? 'U').toUpperCase();

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.28, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-60 md:hidden flex flex-col"
      style={{ backgroundColor: '#0A0805' }}
    >
      <div className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-sm font-semibold tracking-[0.15em] uppercase" style={{ color: '#C9A96E', fontFamily: 'var(--font-playfair)' }}>
          Menu
        </span>
        <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)' }}>
          <X size={22} />
        </button>
      </div>

      {signedIn && (
        <div className="flex items-center gap-3 mx-6 mt-5 mb-2 p-4 rounded-xl" style={{ backgroundColor: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.18)' }}>
          <Avatar initials={initials} size={40} />
          <div className="min-w-0">
            {fullName && (
              <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }}>
                {fullName}
              </p>
            )}
            <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {email}
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 flex flex-col px-6 pt-6 gap-1">
        {[
          { label: 'Menu', href: '/menu' },
          { label: 'Track Order', href: '/track' },
          ...(!signedIn ? [{ label: 'Sign Up', href: '/join' }] : []),
        ].map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="py-3.5 text-xl font-semibold transition-colors hover:opacity-80"
            style={{ color: '#FFFFFF', fontFamily: 'var(--font-playfair)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            {label}
          </Link>
        ))}

        {signedIn && (
          <>
            <button
              onClick={() => { onClose(); router.push('/orders'); }}
              className="py-3.5 text-xl font-semibold text-left transition-colors hover:opacity-80"
              style={{ color: '#FFFFFF', fontFamily: 'var(--font-playfair)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              My Orders
            </button>
            <button
              onClick={() => { onClose(); router.push('/profile'); }}
              className="py-3.5 text-xl font-semibold text-left transition-colors hover:opacity-80"
              style={{ color: '#FFFFFF', fontFamily: 'var(--font-playfair)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              My Profile
            </button>
          </>
        )}

        <Link
          href="/cart"
          onClick={onClose}
          className="py-3.5 text-xl font-semibold flex items-center gap-2 transition-colors hover:opacity-80"
          style={{ color: '#C9A96E', fontFamily: 'var(--font-playfair)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <ShoppingBag size={18} />
          Cart {itemCount > 0 && `(${itemCount})`}
        </Link>
      </nav>

      {signedIn && (
        <div className="px-6 pb-8">
          <button
            onClick={() => { onClose(); onSignOut(); }}
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#DC2626' }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </motion.div>
  );
}
