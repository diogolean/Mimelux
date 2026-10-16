import values from "./tokens.json";

export const tokens = values;

export const palette = {
  background: "#FAF8F5",
  surface: "#F0E8DE",
  primary: "#E9A15E",
  accent: "#E9B0A7",
  text: "#202027",
  darkBackground: "#151519",
  darkSurface: "#202027",
  darkText: "#FAF8F5",
} as const;

export type PaletteToken = keyof typeof palette;
