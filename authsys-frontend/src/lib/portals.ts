// Centralized, env-driven — never hardcode a port/host in a component again.
// Set these in .env.local (dev) and your real deploy env (staging/prod):
//   NEXT_PUBLIC_TOUR_PORTAL_URL=http://localhost:3001
export const TOUR_PORTAL_URL =
    process.env.NEXT_PUBLIC_TOUR_PORTAL_URL ?? "http://localhost:3001";