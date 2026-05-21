export interface ThemeColors {
  background: string;
  cardBackground: string;
  gridLine: string;
  snakeHead: string;
  snakeBody: string;
  foodRegular: string;
  foodBonus: string;
  foodSpecial: string;
  obstacle: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  glassBackground: string;
}

export type ThemeName = "NEO_NOIR" | "RETRO_ARCADE" | "CYBERPUNK";

export const THEMES: Record<ThemeName, { name: string; colors: ThemeColors }> = {
  NEO_NOIR: {
    name: "Neo Noir",
    colors: {
      background: "#08080C",
      cardBackground: "#12121A",
      gridLine: "rgba(0, 255, 102, 0.08)",
      snakeHead: "#00FF66",
      snakeBody: "#00D655",
      foodRegular: "#FF3366", // Red
      foodBonus: "#FF9800",   // Orange
      foodSpecial: "#B829E3", // Purple
      obstacle: "#303040",
      textPrimary: "#FFFFFF",
      textSecondary: "#A0A0B0",
      accent: "#00FF66",
      glassBackground: "rgba(25, 25, 35, 0.7)",
    },
  },
  RETRO_ARCADE: {
    name: "Retro Arcade",
    colors: {
      background: "#051A0E",
      cardBackground: "#0A2917",
      gridLine: "rgba(0, 230, 118, 0.08)",
      snakeHead: "#00E676",
      snakeBody: "#00B0FF", // Teal body
      foodRegular: "#F50057",
      foodBonus: "#FFD600",
      foodSpecial: "#AA00FF",
      obstacle: "#2E4A3F",
      textPrimary: "#E8F5E9",
      textSecondary: "#81C784",
      accent: "#00E676",
      glassBackground: "rgba(10, 41, 23, 0.75)",
    },
  },
  CYBERPUNK: {
    name: "Cyberpunk",
    colors: {
      background: "#0F051D",
      cardBackground: "#1B0B30",
      gridLine: "rgba(255, 0, 127, 0.08)",
      snakeHead: "#FF007F", // Laser pink
      snakeBody: "#00F0FF", // Electric cyan body
      foodRegular: "#FF007F",
      foodBonus: "#FFEA00",
      foodSpecial: "#7000FF",
      obstacle: "#4A0E4E",
      textPrimary: "#FFFFFF",
      textSecondary: "#D3B7FF",
      accent: "#FF007F",
      glassBackground: "rgba(27, 11, 48, 0.75)",
    },
  },
};

export const UI_STYLES = {
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontFamily: {
    regular: "System",
    bold: "System",
    mono: "Courier New",
  },
  shadows: {
    glow: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 5,
    }),
    subtle: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 3,
    },
  },
};
