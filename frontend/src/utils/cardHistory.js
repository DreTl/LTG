const KEY = 'ltg-team-card-history';
const MAX_ITEMS = 24;
const THUMB_WIDTH = 480;

function makeThumb(canvas) {
  const ratio = canvas.height / canvas.width;
  const w = THUMB_WIDTH;
  const h = Math.round(THUMB_WIDTH * ratio);
  const tc = document.createElement('canvas');
  tc.width = w;
  tc.height = h;
  const ctx = tc.getContext('2d');
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(canvas, 0, 0, w, h);
  return tc.toDataURL('image/jpeg', 0.72);
}

export function getCardHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCardToHistory(canvas, meta) {
  try {
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      thumb: makeThumb(canvas),
      ...meta,
    };
    const next = [record, ...getCardHistory()].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(next));
    return record;
  } catch {
    return null;
  }
}

export function deleteCardFromHistory(id) {
  const next = getCardHistory().filter((r) => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearCardHistory() {
  localStorage.removeItem(KEY);
}
