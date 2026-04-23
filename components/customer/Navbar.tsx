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
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useProfileStore } from '@/lib/stores/profile.store';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
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

  const token = mounted ? rawToken : null;
  const signedIn = !!token;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (signedIn && !profile) void fetchProfile();
  }, [signedIn, profile, fetchProfile]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signout();
    router.push('/');
    router.refresh();
  };

  const email = profile?.email ?? user?.email ?? null;
  const fullName = profile?.full_name ?? user?.full_name ?? null;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(26, 26, 26, 0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(255, 90, 60, 0.32)',
              }}
            >
              E&F
            </div>
            <span
              className="text-lg font-semibold hidden sm:block"
              style={{ color: '#1A1A1A', fontFamily: 'var(--font-playfair)' }}
            >
              Ember & Forge
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/menu"
              className="text-sm font-medium transition-opacity hover:opacity-100"
              style={{ color: '#1A1A1A', opacity: 0.75 }}
            >
              Menu
            </Link>
            <Link
              href="/track"
              className="text-sm font-medium transition-opacity hover:opacity-100"
              style={{ color: '#1A1A1A', opacity: 0.75 }}
            >
              Track Order
            </Link>
            {!signedIn && (
              <Link
                href="/join"
                className="text-sm font-medium transition-opacity hover:opacity-100"
                style={{ color: '#1A1A1A', opacity: 0.75 }}
              >
                Sign Up
              </Link>
            )}

            {signedIn && (
              <ProfileDropdown
                fullName={fullName}
                email={email}
                onSignOut={handleSignOut}
              />
            )}

            {/* Cart */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)',
                color: '#FFFFFF',
                boxShadow: '0 6px 18px rgba(255, 90, 60, 0.28)',
              }}
            >
              <ShoppingBag size={18} />
              <span>Cart</span>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </button>
          </nav>

          {/* Mobile right side */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative"
              style={{ color: '#FF5A3C' }}
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
                >
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileOpen(true)} style={{ color: '#1A1A1A' }}>
              <Menu size={24} />
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
            openCart={() => {
              setMobileOpen(false);
              setCartOpen(true);
            }}
            onSignOut={handleSignOut}
          />
        )}
      </AnimatePresence>

      <CartSidebar open={cartOpen} onOpenChange={setCartOpen} />
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full px-2 py-1 transition-all hover:scale-105"
        style={{ backgroundColor: 'rgba(26,26,26,0.06)' }}
      >
        <Avatar initials={initials} size={32} />
        <span
          className="text-sm font-medium max-w-22.5 truncate"
          style={{ color: '#1A1A1A' }}
        >
          {displayName}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: '#4A4A4A',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
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
            className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid rgba(26,26,26,0.08)',
              zIndex: 100,
            }}
          >
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}
            >
              <Avatar initials={initials} size={36} />
              <div className="min-w-0">
                {fullName && (
                  <p className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>
                    {fullName}
                  </p>
                )}
                <p className="text-xs truncate" style={{ color: '#4A4A4A' }}>
                  {email}
                </p>
              </div>
            </div>

            <div className="py-1.5">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/orders');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ color: '#1A1A1A' }}
              >
                <ClipboardList size={15} style={{ color: '#FF5A3C' }} />
                My Orders
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ color: '#1A1A1A' }}
              >
                <User size={15} style={{ color: '#FF5A3C' }} />
                My Profile
              </button>
            </div>

            <div style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }} className="py-1.5">
              <button
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-50"
                style={{ color: '#DC2626' }}
              >
                <LogOut size={15} />
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
      className="rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)',
        color: '#FFFFFF',
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
  openCart,
  onSignOut,
}: {
  signedIn: boolean;
  fullName: string | null;
  email: string | null;
  itemCount: number;
  onClose: () => void;
  openCart: () => void;
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 md:hidden"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-end">
          <button onClick={onClose} style={{ color: '#1A1A1A' }}>
            <X size={28} />
          </button>
        </div>

        {signedIn && (
          <div
            className="flex items-center gap-3 mt-4 mb-6 p-4 rounded-2xl"
            style={{ backgroundColor: '#FFF7EC' }}
          >
            <Avatar initials={initials} size={44} />
            <div className="min-w-0">
              {fullName && (
                <p className="font-semibold truncate" style={{ color: '#1A1A1A' }}>
                  {fullName}
                </p>
              )}
              <p className="text-sm truncate" style={{ color: '#4A4A4A' }}>
                {email}
              </p>
            </div>
          </div>
        )}

        <nav className="flex-1 flex flex-col items-center justify-center gap-8">
          <Link
            href="/menu"
            onClick={onClose}
            className="text-2xl font-semibold"
            style={{ color: '#1A1A1A', fontFamily: 'var(--font-playfair)' }}
          >
            Menu
          </Link>
          <Link
            href="/track"
            onClick={onClose}
            className="text-2xl font-semibold"
            style={{ color: '#1A1A1A', fontFamily: 'var(--font-playfair)' }}
          >
            Track Order
          </Link>
          {signedIn ? (
            <>
              <button
                onClick={() => {
                  onClose();
                  router.push('/orders');
                }}
                className="text-2xl font-semibold"
                style={{ color: '#1A1A1A', fontFamily: 'var(--font-playfair)' }}
              >
                My Orders
              </button>
              <button
                onClick={() => {
                  onClose();
                  router.push('/profile');
                }}
                className="text-2xl font-semibold"
                style={{ color: '#1A1A1A', fontFamily: 'var(--font-playfair)' }}
              >
                My Profile
              </button>
            </>
          ) : (
            <Link
              href="/join"
              onClick={onClose}
              className="text-2xl font-semibold"
              style={{ color: '#1A1A1A', fontFamily: 'var(--font-playfair)' }}
            >
              Sign Up
            </Link>
          )}
          <button
            type="button"
            onClick={openCart}
            className="text-2xl font-semibold"
            style={{ color: '#FF5A3C', fontFamily: 'var(--font-playfair)' }}
          >
            Cart ({itemCount})
          </button>
          {signedIn && (
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="text-lg font-semibold"
              style={{ color: '#DC2626' }}
            >
              Sign out
            </button>
          )}
        </nav>
      </div>
    </motion.div>
  );
}
