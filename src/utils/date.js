const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(value) {
  return String(value).padStart(2, '0');
}

export function createIsoTimestamp(now = new Date()) {
  return new Date(now).toISOString();
}

export function createLocalDate(now = new Date()) {
  const date = new Date(now);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isValidIsoTimestamp(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

export function isValidLocalDate(value) {
  if (typeof value !== 'string' || !LOCAL_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const candidate = new Date(year, month - 1, day);

  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  );
}

export function isFutureLocalDate(value, today = createLocalDate()) {
  return isValidLocalDate(value) && value > today;
}
