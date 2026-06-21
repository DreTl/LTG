import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import Logo from './Logo';

const socials = [
  { icon: FaFacebook, label: 'Facebook', href: '#' },
  { icon: FaInstagram, label: 'Instagram', href: '#' },
  { icon: FaTiktok, label: 'TikTok', href: '#' },
  { icon: FaWhatsapp, label: 'WhatsApp', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12" style={{ opacity: 0.75 }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-5">
          <Logo to="/" size="lg" />

          <p className="text-white/55 text-sm max-w-md">
            Professional League Table Generator — create, manage and export broadcast-ready
            football standings.
          </p>

          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:text-white"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <Link to="/#features" className="hover:text-white/70 transition-colors">Features</Link>
            <Link to="/standings" className="hover:text-white/70 transition-colors">Standings</Link>
            <Link to="/admin/login" className="hover:text-white/70 transition-colors">Admin</Link>
          </div>

          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} LTG — League Table Generator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
