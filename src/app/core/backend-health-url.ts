/** Render's health endpoint lives at the service root, not under its /api prefix. */
export function backendHealthUrl(apiUrl: string): string {
  const api = apiUrl.replace(/\/+$/, '');
  return (api.endsWith('/api') ? api.slice(0, -4) : api) + '/health';
}
