export function parseDateOrNull(value) {
  if (!value || value === 'null') return null;
  return new Date(value);
}

export function parseNumberOrNull(value) {
  if (!value || value === 'null') return null;
  return Number(value);
}

