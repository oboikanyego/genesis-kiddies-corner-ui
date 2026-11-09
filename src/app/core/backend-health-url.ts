/** Render's health endpoint lives at the service root, not under its /api prefix. */
export function backendHealthUrl(apiUrl: string): string {
  const api = apiUrl.replace(/\/+$/, '');
  return (api.endsWith('/api') ? api.slice(0, -4) : api) + '/health';
}

/** A free Render service can become idle after about 15 minutes without requests. */
export const BACKEND_IDLE_RECHECK_MS = 15 * 60 * 1000;

/**
 * Check the connection again when there has been no successful backend contact
 * for at least 15 minutes. A backwards clock adjustment is treated as stale.
 */
export function shouldRecheckBackend(lastContactAt: number | null, now: number): boolean {
  return lastContactAt === null || now < lastContactAt || now - lastContactAt >= BACKEND_IDLE_RECHECK_MS;
}
