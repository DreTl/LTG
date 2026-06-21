import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tournament APIs
export const getTournaments = () => api.get('/tournaments');
export const getTournament = (id) => api.get(`/tournaments/${id}`);
export const createTournament = (data) => api.post('/tournaments', data);
export const updateTournament = (id, data) => api.put(`/tournaments/${id}`, data);
export const deleteTournament = (id) => api.delete(`/tournaments/${id}`);

// Team APIs
export const getTeams = (tournamentId) =>
  api.get('/teams', { params: { tournament_id: tournamentId } });
export const getTeam = (id) => api.get(`/teams/${id}`);
export const createTeam = (formData) =>
  api.post('/teams', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateTeam = (id, formData) =>
  api.put(`/teams/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteTeam = (id) => api.delete(`/teams/${id}`);

// Match APIs
export const getMatches = (tournamentId) =>
  api.get('/matches', { params: { tournament_id: tournamentId } });
export const getMatch = (id) => api.get(`/matches/${id}`);
export const createMatch = (data) => api.post('/matches', data);
export const updateMatch = (id, data) => api.put(`/matches/${id}`, data);
export const deleteMatch = (id) => api.delete(`/matches/${id}`);

// Standings API
export const getStandings = (tournamentId) => api.get(`/standings/${tournamentId}`);

// Best Team of the Week API
export const getBestTeam = (tournamentId, weekStart) =>
  api.get(`/best-team/${tournamentId}`, {
    params: weekStart ? { week_start: weekStart } : {},
  });

// Fixtures API
export const generateFixtures = (teams, doubleRound = false) =>
  api.post('/fixtures/generate', { teams, double_round: doubleRound });
export const getTournamentFixtures = (tournamentId, doubleRound = false) =>
  api.get(`/fixtures/${tournamentId}`, { params: { double_round: doubleRound ? 1 : 0 } });

// Team Profile Card API
export const getTeamProfile = (teamId) => api.get(`/team-profile/${teamId}`);

// Stats API
export const getStats = () => api.get('/stats');

export default api;
