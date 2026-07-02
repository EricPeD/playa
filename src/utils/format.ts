export function formatCurrency(value: number) {
  return value.toFixed(2).replace('.', ',') + ' €';
}

export function elapsed(isoString: string) {
  const timestamp = new Date(isoString).getTime();
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
