/** Supported player positions (code -> full display name). */
export const POSITIONS = [
  { code: 'GK', name: 'Goalkeeper' },
  { code: 'CB', name: 'Centre Back' },
  { code: 'RB', name: 'Right Back' },
  { code: 'LB', name: 'Left Back' },
  { code: 'CDM', name: 'Defensive Midfielder' },
  { code: 'CM', name: 'Central Midfielder' },
  { code: 'CAM', name: 'Attacking Midfielder' },
  { code: 'RW', name: 'Right Wing' },
  { code: 'LW', name: 'Left Wing' },
  { code: 'ST', name: 'Striker' },
  { code: 'CF', name: 'Centre Forward' },
];

const POSITION_NAME_MAP = POSITIONS.reduce((acc, p) => {
  acc[p.code] = p.name;
  return acc;
}, {});

export function positionName(code) {
  return POSITION_NAME_MAP[code] || code || '';
}

const GROUPS = {
  GK: 'goalkeeper',
  CB: 'defender',
  RB: 'defender',
  LB: 'defender',
  CDM: 'midfielder',
  CM: 'midfielder',
  CAM: 'midfielder',
  RW: 'forward',
  LW: 'forward',
  ST: 'forward',
  CF: 'forward',
};

export function positionGroup(code) {
  return GROUPS[code] || 'midfielder';
}
