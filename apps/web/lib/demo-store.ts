"use client";

const key = "mimelux-demo";

export type DemoState = {
  signedIn: boolean;
  role: "fan" | "creator";
  verified: boolean;
  onboarding: boolean;
  coachSeen: boolean;
  subscriptions: string[];
  unlocks: string[];
  cookieAccepted: boolean;
};

const defaults: DemoState = {
  signedIn: false,
  role: "fan",
  verified: false,
  onboarding: false,
  coachSeen: false,
  subscriptions: ["helena"],
  unlocks: [],
  cookieAccepted: false,
};

export function readDemo(): DemoState {
  if (typeof window === "undefined") return defaults;
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return defaults;
  }
}

export function writeDemo(patch: Partial<DemoState>) {
  const next = { ...readDemo(), ...patch };
  localStorage.setItem(key, JSON.stringify(next));
  window.dispatchEvent(new Event("mimelux:state"));
  return next;
}

export function resetDemo() {
  localStorage.removeItem(key);
  window.dispatchEvent(new Event("mimelux:state"));
}

export function mockDelay(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
