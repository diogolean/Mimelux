import values from "./tokens.json";

export const tokens = values;

export const palette = {
  light: {
    background: "#F7F7FB",
    surface: "#ECECF5",
    elevated: "#FFFFFF",
    primary: "#A996FF",
    primaryStrong: "#5437D1",
    accent: "#62D4C8",
    accentStrong: "#08766F",
    text: "#181725",
    muted: "#625F73",
  },
  dark: {
    background: "#0C0D14",
    surface: "#171925",
    elevated: "#202331",
    primary: "#A996FF",
    primaryStrong: "#C0B5FF",
    accent: "#62D4C8",
    accentStrong: "#7EE6DC",
    text: "#F6F4FF",
    muted: "#AAA7B8",
  },
} as const;

export type ThemeName = keyof typeof palette;
export type PaletteToken = keyof (typeof palette)["light"];
