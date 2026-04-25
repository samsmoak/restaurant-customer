import Link from 'next/link';
import { Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#070604', borderTop: '1px solid rgba(201,169,110,0.15)' }}>
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, #D4AA6A 0%, #9A6E30 100%)',
                  color: '#FFF8EE',
                  boxShadow: '0 3px 12px rgba(154,110,48,0.4)',
                }}
              >
                E&F
              </div>
              <span
                className="text-lg font-semibold"
                style={{ color: '#FFFFFF', fontFamily: 'var(--font-playfair)' }}
              >
                Ember &amp; Forge
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-space-grotesk)' }}>
              Crafting bright, joyful dining experiences with fresh ingredients and bold flavors since 2020.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-[0.18em] mb-5"
              style={{ color: '#C9A96E', fontFamily: 'var(--font-space-grotesk)' }}
            >
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-space-grotesk)' }}>
                <Phone size={14} style={{ color: '#C9A96E', flexShrink: 0 }} />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-space-grotesk)' }}>
                <MapPin size={14} style={{ color: '#C9A96E', flexShrink: 0, marginTop: 2 }} />
                <span>123 Culinary Ave, Foodville, CA 90210</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-space-grotesk)' }}>
                <Clock size={14} style={{ color: '#C9A96E', flexShrink: 0 }} />
                <span>Mon–Sat 9AM–11PM · Sun 10AM–9PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-[0.18em] mb-5"
              style={{ color: '#C9A96E', fontFamily: 'var(--font-space-grotesk)' }}
            >
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link href="/menu" className="block text-sm transition-colors hover:text-[#C9A96E]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-space-grotesk)' }}>
                Browse Menu
              </Link>
              <Link href="/track" className="block text-sm transition-colors hover:text-[#C9A96E]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-space-grotesk)' }}>
                Track Your Order
              </Link>
              <Link href="/join" className="block text-sm transition-colors hover:text-[#C9A96E]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-space-grotesk)' }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-7 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-space-grotesk)' }}>
            © {new Date().getFullYear()} Ember &amp; Forge. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs cursor-pointer transition-colors hover:text-[#C9A96E]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-space-grotesk)' }}>
              Privacy Policy
            </span>
            <span className="text-xs cursor-pointer transition-colors hover:text-[#C9A96E]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-space-grotesk)' }}>
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
