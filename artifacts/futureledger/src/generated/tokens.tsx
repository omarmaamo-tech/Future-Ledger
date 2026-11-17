/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#f5f5f5",
      "foreground": "#080808",
      "border": "#dedede",
      "card": "#ffffff",
      "cardForeground": "#080808",
      "popover": "#ffffff",
      "popoverForeground": "#080808",
      "primary": "#080808",
      "primaryForeground": "#ffffff",
      "secondary": "#ededed",
      "secondaryForeground": "#080808",
      "muted": "#eeeeee",
      "mutedForeground": "#545454",
      "accent": "#1f467d",
      "accentForeground": "#ffffff",
      "destructive": "#bd2929",
      "destructiveForeground": "#ffffff",
      "input": "#dedede",
      "ring": "#080808",
      "chart1": "#080808",
      "chart2": "#2f6196",
      "chart3": "#d78a2d",
      "chart4": "#717171",
      "chart5": "#4d82a8",
      "sidebar": "#080808",
      "sidebarForeground": "#f5f5f5",
      "sidebarBorder": "#303030",
      "sidebarPrimary": "#1f467d",
      "sidebarPrimaryForeground": "#ffffff",
      "sidebarAccent": "#202020",
      "sidebarAccentForeground": "#f5f5f5",
      "sidebarRing": "#1f467d"
    },
    "dark": {
      "background": "#090909",
      "foreground": "#f5f5f5",
      "border": "#303030",
      "card": "#141414",
      "cardForeground": "#f5f5f5",
      "popover": "#141414",
      "popoverForeground": "#f5f5f5",
      "primary": "#f5f5f5",
      "primaryForeground": "#080808",
      "secondary": "#222222",
      "secondaryForeground": "#f5f5f5",
      "muted": "#1b1b1b",
      "mutedForeground": "#b8b8b8",
      "accent": "#6f95d6",
      "accentForeground": "#0b1224",
      "destructive": "#ff7777",
      "destructiveForeground": "#260b0b",
      "input": "#414141",
      "ring": "#d2ff3a",
      "chart1": "#f5f5f5",
      "chart2": "#72a2d7",
      "chart3": "#f0a65a",
      "chart4": "#929292",
      "chart5": "#70a6c9",
      "sidebar": "#050505",
      "sidebarForeground": "#f5f5f5",
      "sidebarBorder": "#2b2b2b",
      "sidebarPrimary": "#6f95d6",
      "sidebarPrimaryForeground": "#0b1224",
      "sidebarAccent": "#1b1b1b",
      "sidebarAccentForeground": "#f5f5f5",
      "sidebarRing": "#6f95d6"
    }
  },
  "fontFamily": {
    "sans": [
      "Inter",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "IBM Plex Mono",
      "monospace"
    ]
  },
  "radius": "0.5rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
