import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TournamentPage from './pages/TournamentPage';
import TeamsPage from './pages/TeamsPage';
import MatchPage from './pages/MatchPage';
import StandingsPage from './pages/StandingsPage';
import BestTeamPage from './pages/BestTeamPage';
import GeneratePage from './pages/GeneratePage';
import FixturesPage from './pages/FixturesPage';
import TeamProfilePage from './pages/TeamProfilePage';
import TeamProfileHistory from './pages/TeamProfileHistory';
import PlayersPage from './pages/PlayersPage';
import AddPlayerPage from './pages/AddPlayerPage';
import TopScorersPage from './pages/TopScorersPage';
import GoldenBootPage from './pages/GoldenBootPage';
import PlayerOfTheWeekPage from './pages/PlayerOfTheWeekPage';
import PlayerProfilePage from './pages/PlayerProfilePage';

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('tablegen-auth') === 'true';
  return isAuth ? children : <Navigate to="/admin/login" replace />;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Navbar />
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/standings"
            element={
              <PublicLayout>
                <StandingsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/best-team"
            element={
              <PublicLayout>
                <BestTeamPage />
              </PublicLayout>
            }
          />
          <Route
            path="/team-profile"
            element={
              <PublicLayout>
                <TeamProfilePage />
              </PublicLayout>
            }
          />
          <Route
            path="/team-profile/history"
            element={
              <PublicLayout>
                <TeamProfileHistory />
              </PublicLayout>
            }
          />
          <Route
            path="/top-scorers"
            element={
              <PublicLayout>
                <TopScorersPage />
              </PublicLayout>
            }
          />
          <Route
            path="/golden-boot"
            element={
              <PublicLayout>
                <GoldenBootPage />
              </PublicLayout>
            }
          />
          <Route
            path="/player-of-the-week"
            element={
              <PublicLayout>
                <PlayerOfTheWeekPage />
              </PublicLayout>
            }
          />
          <Route
            path="/player-profile"
            element={
              <PublicLayout>
                <PlayerProfilePage />
              </PublicLayout>
            }
          />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/tournaments" element={<AdminRoute><TournamentPage /></AdminRoute>} />
          <Route path="/admin/tournament/:tournamentId/teams" element={<AdminRoute><TeamsPage /></AdminRoute>} />
          <Route path="/admin/tournament/:tournamentId/players" element={<AdminRoute><PlayersPage /></AdminRoute>} />
          <Route path="/admin/tournament/:tournamentId/players/new" element={<AdminRoute><AddPlayerPage /></AdminRoute>} />
          <Route path="/admin/tournament/:tournamentId/players/:playerId/edit" element={<AdminRoute><AddPlayerPage /></AdminRoute>} />
          <Route path="/admin/tournament/:tournamentId/matches" element={<AdminRoute><MatchPage /></AdminRoute>} />
          <Route path="/admin/tournament/:tournamentId/generate" element={<AdminRoute><GeneratePage /></AdminRoute>} />
          <Route path="/admin/tournament/:tournamentId/fixtures" element={<AdminRoute><FixturesPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          theme="dark"
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
