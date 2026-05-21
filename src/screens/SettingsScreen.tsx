import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";
import { ThemeColors, ThemeName, THEMES, UI_STYLES } from "../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

interface SettingsScreenProps {
  colors: ThemeColors;
  themeName: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  controlType: "SWIPE" | "DPAD" | "BOTH";
  onControlTypeChange: (type: "SWIPE" | "DPAD" | "BOTH") => void;
  hapticsEnabled: boolean;
  onHapticsToggle: (val: boolean) => void;
  soundEnabled: boolean;
  onSoundToggle: (val: boolean) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  colors,
  themeName,
  onThemeChange,
  controlType,
  onControlTypeChange,
  hapticsEnabled,
  onHapticsToggle,
  soundEnabled,
  onSoundToggle,
  onBack,
}) => {

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data?",
      "This will erase all high scores, accumulated points, skins, and game statistics forever. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            try {
              const keys = [
                "@snake_classic_highscore",
                "@snake_endless_highscore",
                "@snake_time_attack_highscore",
                "@snake_maze_highscore",
                "@snake_total_games",
                "@snake_total_score",
                "@snake_total_food",
                "@snake_selected_skin",
              ];
              await AsyncStorage.multiRemove(keys);
              Alert.alert("Success", "All statistics and data have been wiped clean.");
            } catch (err) {
              console.warn("Failed to wipe AsyncStorage", err);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: "rgba(255, 255, 255, 0.05)" }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>SETTINGS</Text>
        <View style={{ width: 24 }} /> {/* Balance back button */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Theme Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>VISUAL SKIN THEME</Text>
          <View style={styles.themesList}>
            {(Object.keys(THEMES) as ThemeName[]).map((tName) => {
              const isSelected = themeName === tName;
              const themeInfo = THEMES[tName];
              return (
                <TouchableOpacity
                  key={tName}
                  activeOpacity={0.8}
                  onPress={() => onThemeChange(tName)}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: isSelected ? colors.accent : "transparent",
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <View style={styles.themeCardHeader}>
                    <Text
                      style={[
                        styles.themeNameText,
                        { color: isSelected ? colors.accent : colors.textPrimary },
                      ]}
                    >
                      {themeInfo.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                    )}
                  </View>
                  {/* Colors Preview Row */}
                  <View style={styles.previewRow}>
                    <View style={[styles.colorPreview, { backgroundColor: themeInfo.colors.background }]} />
                    <View style={[styles.colorPreview, { backgroundColor: themeInfo.colors.snakeHead }]} />
                    <View style={[styles.colorPreview, { backgroundColor: themeInfo.colors.foodRegular }]} />
                    <View style={[styles.colorPreview, { backgroundColor: themeInfo.colors.accent }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Control Mode Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CONTROLS STYLE</Text>
          <View style={[styles.controlsSelector, { backgroundColor: colors.cardBackground }]}>
            {(["SWIPE", "DPAD", "BOTH"] as const).map((type) => {
              const isSelected = controlType === type;
              return (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.8}
                  onPress={() => onControlTypeChange(type)}
                  style={[
                    styles.controlOption,
                    isSelected && { backgroundColor: colors.background, borderColor: colors.accent, borderWidth: 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.controlOptionText,
                      { color: isSelected ? colors.accent : colors.textPrimary },
                    ]}
                  >
                    {type === "SWIPE" ? "Swipe Gestures" : type === "DPAD" ? "Virtual D-Pad" : "Both"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            Virtual D-Pad offers retro tactile buttons. Swipe lets you direct the snake seamlessly anywhere.
          </Text>
        </View>

        {/* Audio & Feedback */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>GAMEPLAY RESPONSES</Text>
          
          <View style={[styles.settingRow, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="sparkles-outline" size={20} color={colors.accent} />
              <Text style={[styles.settingRowText, { color: colors.textPrimary }]}>Haptic Tactile Feedback</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={onHapticsToggle}
              trackColor={{ false: "#20202F", true: colors.accent + "50" }}
              thumbColor={hapticsEnabled ? colors.accent : "#707080"}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="volume-medium-outline" size={20} color={colors.accent} />
              <Text style={[styles.settingRowText, { color: colors.textPrimary }]}>Sound Effects</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={onSoundToggle}
              trackColor={{ false: "#20202F", true: colors.accent + "50" }}
              thumbColor={soundEnabled ? colors.accent : "#707080"}
            />
          </View>
        </View>

        {/* Dangerous Operations */}
        <View style={[styles.section, { marginBottom: 60 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SYSTEM MANAGEMENT</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleResetData}
            style={[styles.resetButton, { borderColor: "#FF3366", borderWidth: 1 }]}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3366" />
            <Text style={styles.resetButtonText}>Erase Score Data & Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  themesList: {
    gap: 12,
  },
  themeCard: {
    padding: 16,
    borderRadius: UI_STYLES.borderRadius.md,
  },
  themeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  themeNameText: {
    fontSize: 15,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "600",
  },
  previewRow: {
    flexDirection: "row",
    gap: 8,
  },
  colorPreview: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  controlsSelector: {
    borderRadius: UI_STYLES.borderRadius.md,
    padding: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  controlOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: UI_STYLES.borderRadius.sm,
    borderColor: "transparent",
  },
  controlOptionText: {
    fontSize: 13,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "600",
  },
  hintText: {
    fontSize: 11,
    fontFamily: UI_STYLES.fontFamily.regular,
    marginTop: 8,
    lineHeight: 14,
    paddingHorizontal: 4,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: UI_STYLES.borderRadius.md,
    marginBottom: 10,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingRowText: {
    fontSize: 14,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "500",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: UI_STYLES.borderRadius.md,
    backgroundColor: "transparent",
    gap: 8,
  },
  resetButtonText: {
    color: "#FF3366",
    fontSize: 14,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "600",
  },
});
