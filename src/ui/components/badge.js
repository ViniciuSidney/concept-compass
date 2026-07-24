const TONES = new Set([
  'neutral',
  'primary',
  'info',
  'success',
  'warning',
  'danger',
  'not-started',
  'studying',
  'studied',
  'reinforcement',
  'consolidated',
]);
export function createBadge(documentObject, { label, tone = 'neutral', icon = null }) {
  const badge = documentObject.createElement('span');
  badge.className = `badge badge--${TONES.has(tone) ? tone : 'neutral'}`;
  if (icon) badge.append(icon);
  badge.append(label);
  return badge;
}
