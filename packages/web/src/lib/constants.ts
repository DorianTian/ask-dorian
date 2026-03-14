export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "https://api.askdorian.com")

export const APP_NAME = "Ask Dorian"
