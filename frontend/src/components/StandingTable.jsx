import { motion } from 'framer-motion';
import ExportStandingsTable from './ExportStandingsTable';
import TeamAvatar from './TeamAvatar';

function getPositionBadge(position, totalTeams, highlightPositions = true) {
  if (!highlightPositions) return 'ltg-pos-default';
  if (position === 1) return 'ltg-pos-gold';
  if (position === 2) return 'ltg-pos-silver';
  if (position === 3) return 'ltg-pos-bronze';
  if (position === totalTeams && totalTeams > 3) return 'ltg-pos-last';
  return 'ltg-pos-default';
}

const FORM_LABEL = { W: 'Win', D: 'Draw', L: 'Loss' };

function FormDots({ form }) {
  if (!form || form.length === 0) {
    return <span className="text-white/25">—</span>;
  }
  return (
    <span className="ltg-form">
      {form.map((r, i) => (
        <span
          key={i}
          className={`ltg-form-dot ltg-form-${(r || '').toLowerCase()}`}
          title={FORM_LABEL[r] || r}
        >
          {r}
        </span>
      ))}
    </span>
  );
}

export default function StandingTable({
  standings,
  tournamentName,
  season,
  exportMode = false,
  highlightPositions = true,
  animateRows = false,
  id = 'standings-table',
}) {
  const totalTeams = standings.length;
  const Row = animateRows ? motion.tr : 'tr';
  const Body = animateRows ? motion.tbody : 'tbody';
  const bodyProps = animateRows
    ? {
        initial: 'hidden',
        animate: 'show',
        variants: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } },
      }
    : {};
  const rowProps = animateRows
    ? {
        variants: {
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
        },
      }
    : {};

  if (!standings.length) {
    return (
      <div className="text-center py-12 text-white/40">
        <p className="text-lg">No standings data available.</p>
        <p className="text-sm mt-1">Add teams and match results to generate standings.</p>
      </div>
    );
  }

  if (exportMode) {
    return (
      <ExportStandingsTable
        standings={standings}
        tournamentName={tournamentName}
        season={season}
        id={id}
        highlightPositions={highlightPositions}
      />
    );
  }

  return (
    <div id={id}>
      {(tournamentName || season) && (
        <div className="mb-6">
          <h2 className="display-heading text-3xl md:text-4xl text-white">{tournamentName}</h2>
          {season && <p className="text-white/40 mt-1">Season {season}</p>}
        </div>
      )}

      <div className="ltg-table-wrap overflow-x-auto">
        <table className="ltg-table">
          <thead>
            <tr>
              <th className="text-left" style={{ width: '64px' }}>#</th>
              <th className="text-left">Team</th>
              <th className="text-center">P</th>
              <th className="text-center">W</th>
              <th className="text-center">D</th>
              <th className="text-center">L</th>
              <th className="text-center">GF</th>
              <th className="text-center">GA</th>
              <th className="text-center">GD</th>
              <th className="text-center">PTS</th>
              <th className="text-center" style={{ minWidth: '140px' }}>FORM</th>
            </tr>
          </thead>
          <Body {...bodyProps}>
            {standings.map((team) => {
              const badge = getPositionBadge(team.position, totalTeams, highlightPositions);
              return (
                <Row key={team.team_id} {...rowProps}>
                  <td>
                    <span className={`ltg-pos ${badge}`}>{team.position}</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                      <TeamAvatar logo={team.logo} name={team.team} size={44} className="font-numeric" />
                      <span className="font-medium text-white">{team.team}</span>
                    </div>
                  </td>
                  <td className="text-center font-numeric text-white/70">{team.played}</td>
                  <td className="text-center font-numeric text-white/70">{team.wins}</td>
                  <td className="text-center font-numeric text-white/70">{team.draws}</td>
                  <td className="text-center font-numeric text-white/70">{team.losses}</td>
                  <td className="text-center font-numeric text-white/70">{team.goals_for}</td>
                  <td className="text-center font-numeric text-white/70">{team.goals_against}</td>
                  <td className="text-center font-numeric text-white/85">{team.goal_difference}</td>
                  <td className="text-center pts-cell">{team.points}</td>
                  <td className="text-center"><FormDots form={team.form} /></td>
                </Row>
              );
            })}
          </Body>
        </table>
      </div>
    </div>
  );
}
