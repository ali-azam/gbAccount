/**
 * Base URL of the ASP.NET Core backend (GbAccount.Api).
 *
 * Set NEXT_PUBLIC_API_BASE_URL in .env to point at a different host or port.
 * It must be NEXT_PUBLIC_-prefixed because these fetches run in the browser.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5025";

/** Builds an absolute API URL, e.g. apiUrl("/api/accounts"). */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
