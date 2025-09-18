import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const protocol =
  process.env.NODE_ENV === "production" ? "https" : "http";
export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "lvh.me";

export const AUTH_ORIGIN =
  process.env.NEXT_PUBLIC_AUTH_ORIGIN ?? `${protocol}://${rootDomain}:3000`;
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN ?? `.${rootDomain}`; // optional
export const APP_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? `${rootDomain}:3000`; // optional

export const APP_ORIGIN = (
  process.env.NEXT_PUBLIC_APP_URL ?? `${protocol}://${rootDomain}:3000`
).replace(/\/$/, "");

export function buildRootLoginUrl(): string {
  return `${APP_ORIGIN}/auth/login`;
}
