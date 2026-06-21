const FORM_COLORS = {
  W: { bg: '#22C55E', glow: '0 0 16px rgba(34,197,94,0.45)', color: '#06210f' },
  D: { bg: '#FACC15', glow: '0 0 16px rgba(250,204,21,0.40)', color: '#2a2206' },
  L: { bg: '#EF4444', glow: '0 0 16px rgba(239,68,68,0.45)', color: '#280808' },
};

const FORM_LABEL = { W: 'Win', D: 'Draw', L: 'Loss' };

/**
 * Recent-form circles (W/D/L). Inline-styled so it renders correctly
 * inside html2canvas exports as well as on screen.
 */
export default function FormBadge({ form = [], size = 70, fontSize = 40, gap = 16 }) {
  if (!form.length) {
    return <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: `${fontSize}px` }}>—</span>;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: `${gap}px` }}>
      {form.map((r, i) => {
        const c = FORM_COLORS[r] || FORM_COLORS.D;
        return (
          <span
            key={i}
            title={FORM_LABEL[r] || r}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              background: c.bg,
              color: c.color,
              boxShadow: c.glow,
              fontFamily: 'Rajdhani, Oswald, sans-serif',
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {r}
          </span>
        );
      })}
    </div>
  );
}
