const colors = {
  light: {
    text: "#1a1a2e",
    tint: "#6C63FF",

    background: "#F8F7FF",
    foreground: "#1a1a2e",

    card: "#ffffff",
    cardForeground: "#1a1a2e",

    primary: "#6C63FF",
    primaryForeground: "#ffffff",

    secondary: "#F0EEFF",
    secondaryForeground: "#1a1a2e",

    muted: "#EEF0F8",
    mutedForeground: "#7A7D9C",

    accent: "#F0EEFF",
    accentForeground: "#1a1a2e",

    destructive: "#EF4444",
    destructiveForeground: "#ffffff",

    border: "#E2E0F5",
    input: "#E2E0F5",
  },
  dark: {
    text: "#ECEAFF",
    tint: "#8B84FF",

    background: "#0F0D1C",
    foreground: "#ECEAFF",

    card: "#1A1730",
    cardForeground: "#ECEAFF",

    primary: "#8B84FF",
    primaryForeground: "#ffffff",

    secondary: "#1E1A35",
    secondaryForeground: "#ECEAFF",

    muted: "#1E1A35",
    mutedForeground: "#8A8DAA",

    accent: "#1E1A35",
    accentForeground: "#ECEAFF",

    destructive: "#EF4444",
    destructiveForeground: "#ffffff",

    border: "#2A2744",
    input: "#2A2744",
  },
  radius: 12,
};

export const USER_COLORS: Record<string, string> = {
  zhenya: "#22C55E",
  slava: "#3B82F6",
  kurt: "#FBBF24",
};

export const USER_COLORS_LIGHT: Record<string, string> = {
  zhenya: "#DCFCE7",
  slava: "#DBEAFE",
  kurt: "#FEF9C3",
};

export const USER_NAMES: Record<string, string> = {
  zhenya: "Dwarf",
  slava: "Elf",
  kurt: "Satyr",
};

export const USER_INITIALS: Record<string, string> = {
  zhenya: "D",
  slava: "E",
  kurt: "S",
};

export const USERS = ["zhenya", "slava", "kurt"];
export const DAYS = ["среда", "четверг", "пятница"];
export const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default colors;
