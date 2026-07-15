import type { Profile } from "./types";

type DemoAccount = {
  password: string;
  profile: Profile;
};

export const demoAccounts: Record<string, DemoAccount> = {
  ROBIN: {
    password: "Robin@2026!",
    profile: {
      id: "demo-robin",
      staff_id: "ROBIN",
      full_name: "Robin",
      role: "admin",
      active: true,
    },
  },
  JASON: {
    password: "Jason@2026!",
    profile: {
      id: "demo-jason",
      staff_id: "JASON",
      full_name: "Jason",
      role: "workshop_manager",
      active: true,
    },
  },
  ANTHONY: {
    password: "Anthony@2026!",
    profile: {
      id: "demo-anthony",
      staff_id: "ANTHONY",
      full_name: "Anthony",
      role: "mechanic",
      active: true,
    },
  },
  BEN: {
    password: "Ben@2026!",
    profile: {
      id: "demo-ben",
      staff_id: "BEN",
      full_name: "Ben",
      role: "apprentice",
      active: true,
    },
  },
};

const SESSION_KEY = "j1_demo_staff";

export function demoLogin(staffId: string, password: string): Profile | null {
  const account = demoAccounts[staffId.trim().toUpperCase()];
  if (!account || account.password !== password) return null;
  localStorage.setItem(SESSION_KEY, JSON.stringify(account.profile));
  window.dispatchEvent(new Event("j1-demo-auth"));
  return account.profile;
}

export function getDemoProfile(): Profile | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as Profile) : null;
  } catch {
    return null;
  }
}

export function demoLogout() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("j1-demo-auth"));
}
