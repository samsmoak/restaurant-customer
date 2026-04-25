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
  Home,
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
  const hasHero = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    hydrate();
    hydrateCart();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (signedIn && !profile) void fetchProfile();
  }, [signedIn, profile, fetchProfile]);

  useEffect(() => {
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

  // Show background once we leave the hero top (or on any non-hero page)
  const showBg = !hasHero || scrolled;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: showBg ? 'rgba(10,8,5,0.94)' : 'transparent',
          backdropFilter: showBg ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: showBg ? 'blur(20px)' : 'none',
          borderBottom: showBg ? '1px solid rgba(201,169,110,0.1)' : 'none',
          transition: 'background-color 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
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
                  color: '#FFF8EE',
                  boxShadow: '0 3px 12px rgba(154,110,48,0.4)',
                }}
              >
                {restaurant ? restaurant.name.slice(0, 2).toUpperCase() : '…'}
              </div>
            )}
            <span
              className="text-base font-semibold hidden sm:block"
              style={{ color: '#FFFFFF', fontFamily: 'var(--font-playfair)' }}
            >
              {restaurant?.name ?? ''}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: 'Menu', href: '/menu' },
              { label: 'Track Order', href: '/track' },
              ...(!signedIn ? [{ label: 'Sign Up', href: '/join' }] : []),
            ].map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium transition-all hover:opacity-100"
                  style={{
                    color: active ? '#C9A96E' : 'rgba(255,255,255,0.6)',
                    fontFamily: 'var(--font-space-grotesk)',
                    borderBottom: active ? '1px solid rgba(201,169,110,0.5)' : '1px solid transparent',
                    paddingBottom: '2px',
                  }}
                >
                  {label}
                </Link>
              );
            })}

            {signedIn && (
              <ProfileDropdown
                fullName={fullName}
                email={email}
                onSignOut={handleSignOut}
              />
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #D4AA6A 0%, #9A6E30 100%)',
                color: '#FFF8EE',
                borderRadius: 4,
                boxShadow: '0 4px 14px rgba(154,110,48,0.35)',
                fontFamily: 'var(--font-space-grotesk)',
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
                  style={{ backgroundColor: '#0A0805', color: '#EDD07A', border: '1px solid rgba(237,208,122,0.3)' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
          </nav>

          {/* Mobile right side */}
          <div className="flex items-center gap-3.5 md:hidden">
            <Link href="/cart" className="relative" style={{ color: '#C9A96E' }}>
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#0A0805', color: '#EDD07A', border: '1px solid rgba(237,208,122,0.3)' }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(true)} style={{ color: 'rgba(255,255,255,0.8)' }}>
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
}: {
  fullName: string | null;
  email: string | null;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = fullName?.split(' ')[0] || email?.split('@')[0] || 'Account';
  const initials = fullName
    ? fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : (email?.[0] ?? 'U').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 transition-all hover:scale-105"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(201,169,110,0.2)',
          borderRadius: 6,
        }}
      >
        <Avatar initials={initials} size={26} />
        <span className="text-sm font-medium max-w-22.5 truncate" style={{ color: '#FFFFFF' }}>
          {displayName}
        </span>
        <ChevronDown
          size={13}
          style={{
            color: 'rgba(255,255,255,0.5)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
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
            className="absolute right-0 mt-2 w-52 overflow-hidden"
            style={{
              backgroundColor: '#1A1208',
              border: '1px solid rgba(201,169,110,0.18)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
              zIndex: 100,
              borderRadius: 6,
            }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2.5"
              style={{ borderBottom: '1px solid rgba(201,169,110,0.1)' }}
            >
              <Avatar initials={initials} size={32} />
              <div className="min-w-0">
                {fullName && (
                  <p className="text-sm font-semibold truncate" style={{ color: '#FFFFFF', fontFamily: 'var(--font-space-grotesk)' }}>
                    {fullName}
                  </p>
                )}
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {email}
                </p>
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => { setOpen(false); router.push('/orders'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                <ClipboardList size={14} style={{ color: '#C9A96E' }} />
                My Orders
              </button>
              <button
                onClick={() => { setOpen(false); router.push('/profile'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                <User size={14} style={{ color: '#C9A96E' }} />
                My Profile
              </button>
            </div>

            <div style={{ borderTop: '1px solid rgba(201,169,110,0.1)' }} className="py-1">
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-950/40"
                style={{ color: '#F87171' }}
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
  const pathname = usePathname();

  const initials = fullName
    ? fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : (email?.[0] ?? 'U').toUpperCase();

  const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Track Order', href: '/track' },
    ...(!signedIn ? [{ label: 'Sign Up', href: '/join' }] : []),
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.28, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-60 md:hidden flex flex-col"
      style={{ backgroundColor: '#0A0805' }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-6 py-3.5"
        style={{ borderBottom: '1px solid rgba(201,169,110,0.1)' }}
      >
        <div className="flex items-center gap-2">
          <Home size={13} style={{ color: '#C9A96E' }} />
          <span
            className="text-xs font-semibold tracking-[0.18em] uppercase"
            style={{ color: '#C9A96E', fontFamily: 'var(--font-space-grotesk)' }}
          >
            Navigation
          </span>
        </div>
        <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)' }}>
          <X size={22} />
        </button>
      </div>

      {/* User card */}
      {signedIn && (
        <div
          className="flex items-center gap-3 mx-6 mt-5 mb-2 p-4"
          style={{
            backgroundColor: 'rgba(201,169,110,0.07)',
            border: '1px solid rgba(201,169,110,0.15)',
            borderRadius: 6,
          }}
        >
          <Avatar initials={initials} size={40} />
          <div className="min-w-0">
            {fullName && (
              <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF', fontFamily: 'var(--font-space-grotesk)' }}>
                {fullName}
              </p>
            )}
            <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {email}
            </p>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 flex flex-col px-6 pt-6 gap-0">
        {NAV_LINKS.map(({ label, href }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="py-4 text-xl font-semibold transition-opacity hover:opacity-80"
              style={{
                color: active ? '#C9A96E' : '#FFFFFF',
                fontFamily: 'var(--font-playfair)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {label}
            </Link>
          );
        })}

        {signedIn && (
          <>
            <button
              onClick={() => { onClose(); router.push('/orders'); }}
              className="py-4 text-xl font-semibold text-left transition-opacity hover:opacity-70"
              style={{
                color: '#FFFFFF',
                fontFamily: 'var(--font-playfair)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              My Orders
            </button>
            <button
              onClick={() => { onClose(); router.push('/profile'); }}
              className="py-4 text-xl font-semibold text-left transition-opacity hover:opacity-70"
              style={{
                color: '#FFFFFF',
                fontFamily: 'var(--font-playfair)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              My Profile
            </button>
          </>
        )}

        <Link
          href="/cart"
          onClick={onClose}
          className="py-4 text-xl font-semibold flex items-center gap-2.5 transition-opacity hover:opacity-70"
          style={{
            color: '#C9A96E',
            fontFamily: 'var(--font-playfair)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <ShoppingBag size={18} />
          Cart {itemCount > 0 && `(${itemCount})`}
        </Link>
      </nav>

      {/* Sign out */}
      {signedIn && (
        <div className="px-6 pb-8">
          <button
            onClick={() => { onClose(); onSignOut(); }}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: '#F87171', fontFamily: 'var(--font-space-grotesk)' }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </motion.div>
  );
}
