/** Client-side expiry check only (does not verify the signature; the server does that). */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: unknown };
    if (typeof exp !== 'number') return false;
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
