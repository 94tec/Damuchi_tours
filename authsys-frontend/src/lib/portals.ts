const isProd = process.env.NODE_ENV === "production";

export const TOUR_PORTAL_URL = (
    process.env.NEXT_PUBLIC_TOUR_PORTAL_URL ||
    (isProd ? "https://kivanasafaris.com" : "http://localhost:3001")
).replace(/\/+$/, "");