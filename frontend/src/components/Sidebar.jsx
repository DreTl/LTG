import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaTachometerAlt,
  FaTrophy,
  FaUsers,
  FaFutbol,
  FaCalendarAlt,
  FaIdCard,
  FaTable,
  FaSignOutAlt,
  FaHome,
  FaListOl,
  FaChevronUp,
  FaChevronLeft,
  FaTimes,
  FaRunning,
  FaBullseye,
  FaMedal,
  FaUserCircle,
} from 'react-icons/fa';
import Logo from './Logo';
import { useMobileNav } from '../context/MobileNavContext';

/* ----------------------------- shared primitives ---------------------------- */

function SectionLabel({ children }) {
  return (
    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
      {children}
    </p>
  );
}

function SidebarItem({ to, icon: Icon, label, active = false, onClick }) {
  return (
    <Link to={to} onClick={onClick} className={`sidebar-link group ${active ? 'active' : ''}`}>
      <span className="sidebar-indicator" aria-hidden="true" />
      <Icon
        size={17}
        className={active ? 'text-rose-400' : 'text-white/45 group-hover:text-white/80'}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function useClickOutside(handler) {
  const ref = useRef(null);
  useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [handler]);
  return ref;
}

function ProfileMenu({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  const handleLogout = () => {
    localStorage.removeItem('tablegen-auth');
    window.location.href = '/admin/login';
  };

  const handleNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  const menuItem =
    'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors text-left';

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-white/10 bg-[#1a0505] p-1.5 shadow-2xl backdrop-blur-xl">
          <Link to="/standings" className={menuItem} onClick={handleNavigate}>
            <FaListOl size={14} className="text-white/50" />
            Public Standings
          </Link>
          <Link to="/" className={menuItem} onClick={handleNavigate}>
            <FaHome size={14} className="text-white/50" />
            Back to Home
          </Link>
          <div className="my-1.5 h-px bg-white/10" />
          <button type="button" onClick={handleLogout} className={`${menuItem} text-red-400 hover:bg-red-500/15 hover:text-red-300`}>
            <FaSignOutAlt size={14} />
            Sign out
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 55%, #7f1d1d 100%)' }}
        >
          AD
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-medium text-white">Administrator</span>
          <span className="block truncate text-xs text-white/45">admin · LTG</span>
        </span>
        <FaChevronUp size={12} className={`text-white/40 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
}

/* --------------------------------- shells ---------------------------------- */

/** Desktop sticky sidebar (≥ lg). */
function SidebarShell({ header, children }) {
  return (
    <aside className="glass-sidebar sticky top-0 hidden h-screen w-[300px] shrink-0 flex-col lg:flex">
      <div className="border-b border-white/5 p-5">{header}</div>
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">{children}</div>
      <div className="border-t border-white/5 p-3">
        <ProfileMenu />
      </div>
    </aside>
  );
}

/** Mobile slide-in drawer (< lg), driven by the shared MobileNav context. */
function MobileSidebar({ header, children }) {
  const nav = useMobileNav();
  const open = nav?.open ?? false;
  const close = nav?.close ?? (() => {});

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden">
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
          />
          <motion.aside
            className="glass-sidebar fixed inset-y-0 left-0 z-[70] flex w-[85%] max-w-[320px] flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between border-b border-white/5 p-5">
              {header}
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="ml-2 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <FaTimes size={16} />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">{children(close)}</div>
            <div className="border-t border-white/5 p-3">
              <ProfileMenu onNavigate={close} />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------- admin sidebar ------------------------------ */

const menuItems = [
  { to: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
  { to: '/admin/tournaments', icon: FaTrophy, label: 'Tournaments' },
  { to: '/team-profile', icon: FaIdCard, label: 'Team Profile Cards' },
];

const playerCenterItems = [
  { to: '/top-scorers', icon: FaRunning, label: 'Top Scorers' },
  { to: '/player-of-the-week', icon: FaMedal, label: 'Player of the Week' },
  { to: '/golden-boot', icon: FaBullseye, label: 'Golden Boot Race' },
  { to: '/player-profile', icon: FaUserCircle, label: 'Player Profiles' },
];

export default function Sidebar() {
  const location = useLocation();

  const header = (
    <div>
      <Logo to="/admin/dashboard" size="lg" />
      <p className="mt-3 text-white" style={{ fontSize: '13px', opacity: 0.65 }}>
        League Table Generator
      </p>
    </div>
  );

  const body = (onNavigate) => (
    <>
      <div>
        <SectionLabel>Menu</SectionLabel>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={onNavigate}
              active={
                location.pathname === item.to ||
                (item.to === '/admin/tournaments' && location.pathname.includes('/admin/tournament'))
              }
            />
          ))}
        </nav>
      </div>

      <div>
        <SectionLabel>Player Center</SectionLabel>
        <nav className="space-y-1">
          {playerCenterItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={onNavigate}
              active={location.pathname === item.to}
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <SectionLabel>Quick Links</SectionLabel>
        <nav className="space-y-1">
          <SidebarItem to="/standings" icon={FaTable} label="Public Standings" onClick={onNavigate} />
          <SidebarItem to="/" icon={FaHome} label="View Site" onClick={onNavigate} />
        </nav>
      </div>
    </>
  );

  return (
    <>
      <SidebarShell header={header}>{body()}</SidebarShell>
      <MobileSidebar header={header}>{body}</MobileSidebar>
    </>
  );
}

/* ----------------------------- tournament sidebar --------------------------- */

export function TournamentSidebar({ tournamentId, tournamentName }) {
  const location = useLocation();

  const items = [
    { to: `/admin/tournament/${tournamentId}/teams`, icon: FaUsers, label: 'Teams' },
    { to: `/admin/tournament/${tournamentId}/players`, icon: FaRunning, label: 'Players' },
    { to: `/admin/tournament/${tournamentId}/matches`, icon: FaFutbol, label: 'Matches' },
    { to: `/admin/tournament/${tournamentId}/fixtures`, icon: FaCalendarAlt, label: 'Fixtures' },
    { to: `/admin/tournament/${tournamentId}/generate`, icon: FaTable, label: 'Generate Table' },
  ];

  const header = (
    <div>
      <Link
        to="/admin/tournaments"
        className="mb-3 inline-flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white"
      >
        <FaChevronLeft size={10} /> Tournaments
      </Link>
      <h2 className="truncate text-base font-semibold tracking-tight text-white">
        {tournamentName || 'Tournament'}
      </h2>
      <p className="mt-0.5 text-xs text-white/40">Tournament Management</p>
    </div>
  );

  const body = (onNavigate) => (
    <>
      <div>
        <SectionLabel>Manage</SectionLabel>
        <nav className="space-y-1">
          {items.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={onNavigate}
              active={location.pathname === item.to}
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <SectionLabel>Quick Links</SectionLabel>
        <nav className="space-y-1">
          <SidebarItem to="/admin/dashboard" icon={FaTachometerAlt} label="Dashboard" onClick={onNavigate} />
          <SidebarItem to="/standings" icon={FaListOl} label="Public Standings" onClick={onNavigate} />
        </nav>
      </div>
    </>
  );

  return (
    <>
      <SidebarShell header={header}>{body()}</SidebarShell>
      <MobileSidebar header={header}>{body}</MobileSidebar>
    </>
  );
}
