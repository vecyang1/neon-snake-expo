import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { ThemeColors, ThemeName, THEMES, UI_STYLES } from "../styles/theme";
import { Button } from "../components/Button";
import { GameMode } from "../game/useGameEngine";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Use Expo Vector Icons which are built-in and guaranteed to compile
import { Ionicons } from "@expo/vector-icons";

interface MainMenuScreenProps {
  colors: ThemeColors;
  themeName: ThemeName;
  onPlay: (mode: GameMode) => void;
  onNavigateToSettings: () => void;
  onNavigateToSkins: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  colors,
  themeName,
  onPlay,
  onNavigateToSettings,
  onNavigateToSkins,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>("CLASSIC");
  const [totalGames, setTotalGames] = useState(0);
  const [overallHighScore, setOverallHighScore] = useState(0);

  // Load cumulative stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const gamesVal = await AsyncStorage.getItem("@snake_total_games");
        const classicHighVal = await AsyncStorage.getItem("@snake_classic_highscore");
        const endlessHighVal = await AsyncStorage.getItem("@snake_endless_highscore");
        const timeHighVal = await AsyncStorage.getItem("@snake_time_attack_highscore");
        const mazeHighVal = await AsyncStorage.getItem("@snake_maze_highscore");

        setTotalGames(gamesVal ? parseInt(gamesVal, 10) : 0);

        const classic = classicHighVal ? parseInt(classicHighVal, 10) : 0;
        const endless = endlessHighVal ? parseInt(endlessHighVal, 10) : 0;
        const time = timeHighVal ? parseInt(timeHighVal, 10) : 0;
        const maze = mazeHighVal ? parseInt(mazeHighVal, 10) : 0;

        setOverallHighScore(Math.max(classic, endless, time, maze));
      } catch (err) {
        console.warn("Failed to load statistics in main menu", err);
      }
    };

    loadStats();
  }, []);

  const getModeDescription = (mode: GameMode) => {
    switch (mode) {
      case "CLASSIC":
        return "Retro speed. Wall collisions terminate the game.";
      case "ENDLESS":
        return "Screen wrapping boundaries. Infinite growth challenge.";
      case "TIME_ATTACK":
        return "60s clock. Eat food to add +5s. Beat the timer.";
      case "MAZE":
        return "Symmetrical grid obstacles. High-precision pathfinding.";
      default:
        return "";
    }
  };

  const getModeIcon = (mode: GameMode) => {
    switch (mode) {
      case "CLASSIC":
        return "game-controller-outline";
      case "ENDLESS":
        return "infinite-outline";
      case "TIME_ATTACK":
        return "hourglass-outline";
      case "MAZE":
        return "grid-outline";
      default:
        return "play";
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Neon Glow Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.titleSub, { color: colors.accent }]}>ARCADE</Text>
          <Text
            style={[
              styles.titleMain,
              {
                color: colors.textPrimary,
                textShadowColor: colors.accent,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 15,
              },
            ]}
          >
            NEON SNAKE
          </Text>
        </View>

        {/* Mode Selector Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            SELECT GAME MODE
          </Text>
          <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
        </View>

        {/* Mode Cards Grid */}
        <View style={styles.modesContainer}>
          {(["CLASSIC", "ENDLESS", "TIME_ATTACK", "MAZE"] as GameMode[]).map((mode) => {
            const isSelected = selectedMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                activeOpacity={0.85}
                onPress={() => setSelectedMode(mode)}
                style={[
                  styles.modeCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: isSelected ? colors.accent : "rgba(255, 255, 255, 0.05)",
                    borderWidth: 1.5,
                  },
                  isSelected && UI_STYLES.shadows.glow(colors.accent),
                ]}
              >
                <View style={styles.modeCardHeader}>
                  <Ionicons
                    name={getModeIcon(mode) as any}
                    size={24}
                    color={isSelected ? colors.accent : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modeCardTitle,
                      { color: isSelected ? colors.accent : colors.textPrimary },
                    ]}
                  >
                    {mode.replace("_", " ")}
                  </Text>
                </View>
                <Text style={[styles.modeCardDesc, { color: colors.textSecondary }]}>
                  {getModeDescription(mode)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Play Action */}
        <View style={styles.actionContainer}>
          <Button
            label="START GAME"
            colors={colors}
            variant="primary"
            size="lg"
            onPress={() => onPlay(selectedMode)}
            style={styles.playButton}
          />
        </View>

        {/* Secondary Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[
              styles.navCard,
              { backgroundColor: colors.glassBackground, borderColor: "rgba(255,255,255,0.06)" },
            ]}
            onPress={onNavigateToSkins}
          >
            <Ionicons name="shirt-outline" size={20} color={colors.accent} />
            <Text style={[styles.navCardText, { color: colors.textPrimary }]}>Skins Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navCard,
              { backgroundColor: colors.glassBackground, borderColor: "rgba(255,255,255,0.06)" },
            ]}
            onPress={onNavigateToSettings}
          >
            <Ionicons name="settings-outline" size={20} color={colors.accent} />
            <Text style={[styles.navCardText, { color: colors.textPrimary }]}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Cumulative Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>HIGH SCORE</Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {overallHighScore}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>GAMES PLAYED</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {totalGames}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  titleSub: {
    fontSize: 14,
    fontFamily: UI_STYLES.fontFamily.mono,
    letterSpacing: 6,
    fontWeight: "700",
    marginBottom: 4,
  },
  titleMain: {
    fontSize: 38,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  accentBar: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
  },
  modesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modeCard: {
    width: "48%",
    padding: 16,
    borderRadius: UI_STYLES.borderRadius.md,
    marginBottom: 16,
    height: 124,
    justifyContent: "space-between",
  },
  modeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  modeCardTitle: {
    fontSize: 14,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "700",
    marginLeft: 8,
  },
  modeCardDesc: {
    fontSize: 11,
    fontFamily: UI_STYLES.fontFamily.regular,
    lineHeight: 14,
  },
  actionContainer: {
    marginBottom: 20,
  },
  playButton: {
    width: "100%",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 35,
  },
  navCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: UI_STYLES.borderRadius.sm,
    borderWidth: 1,
  },
  navCardText: {
    fontSize: 14,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: UI_STYLES.borderRadius.md,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: UI_STYLES.fontFamily.bold,
    letterSpacing: 1,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontFamily: UI_STYLES.fontFamily.mono,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: "80%",
  },
});
