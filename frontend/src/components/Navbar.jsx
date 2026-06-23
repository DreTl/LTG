import { Link, useLocation } from 'react-router-dom';
import {
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaTable,
  FaFutbol,
  FaMedal,
  FaIdCard,
  FaShieldAlt,
  FaUserShield,
  FaArrowRight,
} from 'react-icons/fa';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMobileNav } from '../context/MobileNavContext';
import Logo from './Logo';
import OriginButton from './ui/OriginButton';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const mobileNav = useMobileNav();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  const navLinks = isAdmin
    ? [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/tournaments', label: 'Tournaments' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/standings', label: 'Standings' },
        { to: '/admin/login', label: 'Admin' },
      ];

  const linkClass = (active) => `nav-pill ${active ? 'active' : ''}`;

  if (isAdmin) {
    return (
      <nav className="sticky top-0 z-50 glass-nav">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-[70px]">
            <Logo to="/admin/dashboard" size="lg" />

            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass(location.pathname === link.to)}>
                  {link.label}
                </Link>
              ))}

              <span className="mx-2 h-6 w-px bg-white/10" aria-hidden="true" />

              <button
                onClick={toggleDarkMode}
                className="text-white/60 p-2.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <FaSun size={15} /> : <FaMoon size={15} />}
              </button>
            </div>

            <button
              className="lg:hidden text-white/70 p-2"
              onClick={() => mobileNav?.toggle()}
              aria-label="Open menu"
            >
              <FaBars size={18} />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  const landingLinks = [
    { to: '/standings', label: 'Standings', icon: FaTable },
    { to: '/top-scorers', label: 'Top Scorers', icon: FaFutbol },
    { to: '/player-of-the-week', label: 'Player of the Week', icon: FaMedal },
    { to: '/player-profile', label: 'Player Cards', icon: FaIdCard },
    { to: '/team-profile', label: 'Team Cards', icon: FaShieldAlt },
  ];

  return (
    <nav className="sticky top-0 z-50 landing-nav">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          <Logo to="/" size="lg" />

          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            {landingLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={linkClass(link.to !== '/#features' && location.pathname === link.to)}
                >
                  {Icon && <Icon size={13} className="nav-pill-icon" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="text-white/60 p-2.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun size={15} /> : <FaMoon size={15} />}
            </button>
            <Link to="/admin/login" className="landing-btn-ghost !py-2 !px-5 !text-sm">
              <FaUserShield size={14} /> Admin
            </Link>
            <OriginButton to="/admin/login" className="landing-btn-primary !py-2 !px-5 !text-sm">
              Get Started <FaArrowRight size={12} />
            </OriginButton>
          </div>

          <button
            className="md:hidden text-white/70 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            {landingLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="nav-pill justify-start"
                  onClick={() => setMobileOpen(false)}
                >
                  {Icon && <Icon size={14} className="nav-pill-icon" />}
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/admin/login"
              className="landing-btn-ghost mx-2 mt-1 justify-center"
              onClick={() => setMobileOpen(false)}
            >
              <FaUserShield size={14} /> Admin
            </Link>
            <Link
              to="/admin/login"
              className="landing-btn-primary mx-2 text-center justify-center"
              onClick={() => setMobileOpen(false)}
            >
              Get Started <FaArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
