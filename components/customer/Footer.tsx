import Link from 'next/link';
import { Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#ECECEC' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(255, 90, 60, 0.28)',
                }}
              >
                E&F
              </div>
              <span
                className="text-xl font-semibold"
                style={{ color: '#1A1A1A', fontFamily: 'var(--font-playfair)' }}
              >
                Ember & Forge
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#4A4A4A' }}>
              Crafting bright, joyful dining experiences with fresh ingredients
              and bold flavors since 2020.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#1A1A1A' }}>
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm" style={{ color: '#4A4A4A' }}>
                <Phone size={16} style={{ color: '#FF5A3C' }} />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: '#4A4A4A' }}>
                <MapPin size={16} style={{ color: '#FFB627' }} />
                <span>123 Culinary Ave, Foodville, CA 90210</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: '#4A4A4A' }}>
                <Clock size={16} style={{ color: '#3EB489' }} />
                <span>Mon–Sat 9AM–11PM · Sun 10AM–9PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#1A1A1A' }}>
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link href="/menu" className="block text-sm transition-colors hover:text-[#FF5A3C]" style={{ color: '#4A4A4A' }}>
                Browse Menu
              </Link>
              <Link href="/track" className="block text-sm transition-colors hover:text-[#FF5A3C]" style={{ color: '#4A4A4A' }}>
                Track Your Order
              </Link>
              <Link href="/join" className="block text-sm transition-colors hover:text-[#FF5A3C]" style={{ color: '#4A4A4A' }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: '#ECECEC' }}
        >
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            © {new Date().getFullYear()} Ember & Forge. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs cursor-pointer" style={{ color: '#9CA3AF' }}>Privacy Policy</span>
            <span className="text-xs cursor-pointer" style={{ color: '#9CA3AF' }}>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
