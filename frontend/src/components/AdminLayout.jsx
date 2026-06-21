import { MobileNavProvider } from '../context/MobileNavContext';

export default function AdminLayout({ children }) {
  return (
    <MobileNavProvider>
      <div className="admin-shell relative min-h-screen platform-bg text-white">
        <div className="admin-orb admin-orb-1" aria-hidden="true" />
        <div className="admin-orb admin-orb-2" aria-hidden="true" />
        <div className="admin-orb admin-orb-3" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </div>
    </MobileNavProvider>
  );
}
