const isProd = process.env.NODE_ENV === "production";
const pick = (v: string | undefined, prod: string, dev: string) =>
    (v || (isProd ? prod : dev)).replace(/\/+$/, "");

export const AUTH_FRONTEND_URL = pick(
    process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL, "https://auth.kivanasafaris.com", "http://localhost:3000");
export const APP_URL = pick(
    process.env.NEXT_PUBLIC_APP_URL, "https://kivanasafaris.com", "http://localhost:3001");