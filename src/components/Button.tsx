import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { ThemeColors, UI_STYLES } from "../styles/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  variant?: "primary" | "secondary" | "glass";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  colors,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
}) => {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isGlass = variant === "glass";

  // Combine background styles
  const buttonStyle = [
    styles.base,
    size === "sm" && styles.sm,
    size === "md" && styles.md,
    size === "lg" && styles.lg,
    isPrimary && {
      backgroundColor: colors.accent,
      ...UI_STYLES.shadows.glow(colors.accent),
    },
    isSecondary && {
      backgroundColor: colors.cardBackground,
      borderColor: colors.accent,
      borderWidth: 1,
    },
    isGlass && {
      backgroundColor: colors.glassBackground,
      borderColor: "rgba(255, 255, 255, 0.15)",
      borderWidth: 1,
    },
    disabled && styles.disabled,
    style,
  ];

  // Combine label styles
  const labelStyle = [
    styles.labelText,
    size === "sm" && styles.labelSm,
    size === "md" && styles.labelMd,
    size === "lg" && styles.labelLg,
    isPrimary && { color: "#000000", fontWeight: "700" as const },
    (isSecondary || isGlass) && { color: colors.textPrimary },
    disabled && { color: colors.textSecondary },
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#000000" : colors.accent} />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: UI_STYLES.borderRadius.md,
    flexDirection: "row",
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: UI_STYLES.borderRadius.lg,
  },
  labelText: {
    textAlign: "center",
    fontFamily: UI_STYLES.fontFamily.bold,
  },
  labelSm: {
    fontSize: 14,
  },
  labelMd: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  labelLg: {
    fontSize: 18,
    letterSpacing: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
