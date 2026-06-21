import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaFutbol, FaLock, FaShieldAlt, FaTrophy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { FadeIn, ScaleIn } from '../components/ui/Motion';
import OriginButton from '../components/ui/OriginButton';

const ADMIN_CREDENTIALS = { username: 'admin', password: 'tablegen2026' };

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (
        username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
      ) {
        localStorage.setItem('tablegen-auth', 'true');
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid username or password');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-shell d-flex flex-column flex-lg-row">
      {/* Left — football illustration + gradient */}
      <div
        className="d-none d-lg-flex col-lg-6 position-relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0B1120 0%, #1E293B 55%, #0F172A 100%)' }}
      >
        <div className="admin-orb admin-orb-1" aria-hidden="true" />
        <div className="admin-orb admin-orb-2" aria-hidden="true" />

        {/* Oversized football mark */}
        <div
          className="position-absolute d-flex align-items-center justify-content-center"
          style={{ right: '-60px', bottom: '-60px', opacity: 0.08 }}
          aria-hidden="true"
        >
          <FaFutbol size={420} className="text-white" />
        </div>

        <FadeIn className="d-flex flex-column justify-content-center px-5 px-xl-8 w-100 position-relative z-1">
          <Link to="/" className="logo-link d-inline-flex align-items-center gap-3 text-white mb-5 text-decoration-none">
            <span
              className="brand-badge d-inline-flex align-items-center justify-content-center rounded-4 text-white"
              style={{ width: 90, height: 90 }}
            >
              <FaFutbol size={44} />
            </span>
            <span className="font-display fw-bold" style={{ fontSize: 56, letterSpacing: 3, lineHeight: 1 }}>
              LTG
            </span>
          </Link>

          <h1 className="display-heading text-white mb-4" style={{ fontSize: 52, lineHeight: 1.05 }}>
            Manage leagues.<br />
            <span className="text-brand">Generate world-class tables.</span>
          </h1>

          <p className="text-white-50 mb-5 pe-lg-5" style={{ maxWidth: 440 }}>
            Professional admin access for tournament organizers. Record match results,
            export broadcast-ready standings, and share them with your community.
          </p>

          <div className="d-flex flex-column gap-3">
            {[
              { icon: FaTrophy, text: 'Automatic standings calculation' },
              { icon: FaShieldAlt, text: 'Secure admin dashboard' },
              { icon: FaFutbol, text: 'PNG, JPG & PDF export' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="d-flex align-items-center gap-3 text-white-50">
                  <span
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: 40, height: 40, background: 'rgba(244,63,94,0.15)', color: '#fb7185' }}
                  >
                    <Icon />
                  </span>
                  <span className="small">{item.text}</span>
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>

      {/* Right — glassmorphism login card */}
      <div
        className="col-lg-6 d-flex align-items-center justify-content-center py-5 px-4 flex-grow-1 position-relative overflow-hidden"
        style={{ minHeight: '100vh', background: 'var(--admin-bg)' }}
      >
        <div className="admin-orb admin-orb-3" aria-hidden="true" />

        <ScaleIn className="login-glass-card position-relative z-1 admin-shell">
          <div className="p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="d-lg-none mb-3">
                <span
                  className="brand-badge d-inline-flex align-items-center justify-content-center rounded-4 text-white"
                  style={{ width: 64, height: 64 }}
                >
                  <FaFutbol size={30} />
                </span>
              </div>
              <h2 className="display-heading text-white mb-2" style={{ fontSize: 30 }}>
                Sign in to LTG
              </h2>
              <p className="text-white-50 small mb-0">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control form-control-lg"
                  placeholder="admin"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control form-control-lg"
                  placeholder="Enter your password"
                />
              </div>

              <OriginButton
                type="submit"
                disabled={loading}
                className="btn-ltg btn-ltg-primary w-100 py-3"
                style={{ width: '100%' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <FaLock size={14} /> Sign in
                  </>
                )}
              </OriginButton>
            </form>

            <hr className="my-4 border-white border-opacity-10" />

            <div className="text-center">
              <p className="small text-white-50 mb-2">Demo credentials</p>
              <div className="d-flex justify-content-center gap-2">
                <span className="pill-badge">admin</span>
                <span className="pill-badge">tablegen2026</span>
              </div>
            </div>
          </div>
        </ScaleIn>

        <p className="position-absolute text-center small text-white-50" style={{ bottom: 24 }}>
          <Link to="/" className="text-brand fw-semibold text-decoration-none">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
