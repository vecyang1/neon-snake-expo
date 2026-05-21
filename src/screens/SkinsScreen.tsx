import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { ThemeColors, UI_STYLES } from "../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export interface SnakeSkin {
  id: string;
  name: string;
  headColor: string;
  bodyColor: string;
  requiredHighScore: number;
  description: string;
}

export const AVAILABLE_SKINS: SnakeSkin[] = [
  {
    id: "default",
    name: "Classic Theme",
    headColor: "",
    bodyColor: "",
    requiredHighScore: 0,
    description: "Matches active visual theme color profiles dynamically.",
  },
  {
    id: "electric_teal",
    name: "Cosmic Teal",
    headColor: "#00F0FF",
    bodyColor: "#00A8FF",
    requiredHighScore: 25,
    description: "Flowing oceanic current vibes. Elegant and bright.",
  },
  {
    id: "laser_pink",
    name: "Laser Pink",
    headColor: "#FF007F",
    bodyColor: "#B800FF",
    requiredHighScore: 60,
    description: "Neon rave look. Flashy pink head with deep violet trails.",
  },
  {
    id: "matrix_green",
    name: "Matrix Code",
    headColor: "#00FF00",
    bodyColor: "#003900",
    requiredHighScore: 120,
    description: "Retro hacker terminals. Pure digital code green.",
  },
  {
    id: "royal_gold",
    name: "Royal Gold",
    headColor: "#FFD700",
    bodyColor: "#DAA520",
    requiredHighScore: 200,
    description: "Pure luxury. Golden dragon scales fitting a master.",
  },
];

interface SkinsScreenProps {
  colors: ThemeColors;
  activeSkinId: string;
  onSkinSelect: (skinId: string) => void;
  onBack: () => void;
}

export const SkinsScreen: React.FC<SkinsScreenProps> = ({
  colors,
  activeSkinId,
  onSkinSelect,
  onBack,
}) => {
  const [classicHigh, setClassicHigh] = useState(0);
  const [endlessHigh, setEndlessHigh] = useState(0);
  const [timeHigh, setTimeHigh] = useState(0);
  const [mazeHigh, setMazeHigh] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const bestOverallScore = Math.max(classicHigh, endlessHigh, timeHigh, mazeHigh);

  // Load scores
  useEffect(() => {
    const loadAllStats = async () => {
      try {
        const valClassic = await AsyncStorage.getItem("@snake_classic_highscore");
        const valEndless = await AsyncStorage.getItem("@snake_endless_highscore");
        const valTime = await AsyncStorage.getItem("@snake_time_attack_highscore");
        const valMaze = await AsyncStorage.getItem("@snake_maze_highscore");
        const valGames = await AsyncStorage.getItem("@snake_total_games");
        const valTotalScore = await AsyncStorage.getItem("@snake_total_score");

        setClassicHigh(valClassic ? parseInt(valClassic, 10) : 0);
        setEndlessHigh(valEndless ? parseInt(valEndless, 10) : 0);
        setTimeHigh(valTime ? parseInt(valTime, 10) : 0);
        setMazeHigh(valMaze ? parseInt(valMaze, 10) : 0);
        setTotalGames(valGames ? parseInt(valGames, 10) : 0);
        setTotalScore(valTotalScore ? parseInt(valTotalScore, 10) : 0);
      } catch (err) {
        console.warn("Failed to load statistics in skins screen", err);
      }
    };

    loadAllStats();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: "rgba(255, 255, 255, 0.05)" }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>SKINS & LEADERBOARD</Text>
        <View style={{ width: 24 }} /> {/* Balance back button */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Milestones Card */}
        <View style={[styles.milestoneBox, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.milestoneHeader}>
            <Ionicons name="trophy-outline" size={22} color={colors.accent} />
            <Text style={[styles.milestoneTitle, { color: colors.textPrimary }]}>YOUR RECORD HIGHS</Text>
          </View>
          <Text style={[styles.milestoneRecord, { color: colors.accent }]}>
            {bestOverallScore} <Text style={{ fontSize: 13, color: colors.textSecondary }}>POINTS</Text>
          </Text>
          <Text style={[styles.milestoneSubtitle, { color: colors.textSecondary }]}>
            Earn higher high scores in classic or specialty modes to unlock rare glowing snake skins.
          </Text>
        </View>

        {/* Skins Selector */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>COSMETIC STORE</Text>
        <View style={styles.skinsContainer}>
          {AVAILABLE_SKINS.map((skin) => {
            const isUnlocked = bestOverallScore >= skin.requiredHighScore;
            const isSelected = activeSkinId === skin.id;

            return (
              <TouchableOpacity
                key={skin.id}
                activeOpacity={isUnlocked ? 0.85 : 1}
                disabled={!isUnlocked}
                onPress={() => onSkinSelect(skin.id)}
                style={[
                  styles.skinCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: isSelected
                      ? colors.accent
                      : isUnlocked
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.02)",
                    borderWidth: 1.5,
                    opacity: isUnlocked ? 1 : 0.45,
                  },
                ]}
              >
                {/* Visual Circle Preview */}
                <View style={styles.skinVisuals}>
                  <View
                    style={[
                      styles.circleHead,
                      {
                        backgroundColor: skin.id === "default" ? colors.snakeHead : skin.headColor,
                        borderColor: "rgba(255, 255, 255, 0.2)",
                        borderWidth: 1,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.circleBody,
                      {
                        backgroundColor: skin.id === "default" ? colors.snakeBody : skin.bodyColor,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.circleBody,
                      {
                        backgroundColor: skin.id === "default" ? colors.snakeBody : skin.bodyColor,
                        opacity: 0.6,
                      },
                    ]}
                  />
                </View>

                {/* Skin Info */}
                <View style={styles.skinInfo}>
                  <Text style={[styles.skinName, { color: colors.textPrimary }]}>{skin.name}</Text>
                  <Text style={[styles.skinDesc, { color: colors.textSecondary }]}>
                    {skin.description}
                  </Text>
                  {!isUnlocked && (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color="#FF3366" />
                      <Text style={styles.lockBadgeText}>
                        Requires {skin.requiredHighScore} Pts
                      </Text>
                    </View>
                  )}
                </View>

                {/* Checkbox or Locker status */}
                <View style={styles.skinStatus}>
                  {isSelected ? (
                    <Ionicons name="checkbox" size={24} color={colors.accent} />
                  ) : isUnlocked ? (
                    <Ionicons name="square-outline" size={24} color={colors.textSecondary} />
                  ) : (
                    <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Global Statistics */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
          FULL RECORD LEADERBOARD
        </Text>
        <View style={[styles.leaderboardBox, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.leaderboardRow}>
            <Text style={[styles.leadLabel, { color: colors.textPrimary }]}>Classic Mode High</Text>
            <Text style={[styles.leadValue, { color: colors.accent }]}>{classicHigh}</Text>
          </View>
          <View style={styles.leadDivider} />
          <View style={styles.leaderboardRow}>
            <Text style={[styles.leadLabel, { color: colors.textPrimary }]}>Endless Mode High</Text>
            <Text style={[styles.leadValue, { color: colors.accent }]}>{endlessHigh}</Text>
          </View>
          <View style={styles.leadDivider} />
          <View style={styles.leaderboardRow}>
            <Text style={[styles.leadLabel, { color: colors.textPrimary }]}>Time Attack High</Text>
            <Text style={[styles.leadValue, { color: colors.accent }]}>{timeHigh}</Text>
          </View>
          <View style={styles.leadDivider} />
          <View style={styles.leaderboardRow}>
            <Text style={[styles.leadLabel, { color: colors.textPrimary }]}>Maze Obstacles High</Text>
            <Text style={[styles.leadValue, { color: colors.accent }]}>{mazeHigh}</Text>
          </View>
          <View style={styles.leadDivider} />
          <View style={styles.leaderboardRow}>
            <Text style={[styles.leadLabel, { color: colors.textPrimary }]}>Total Games Played</Text>
            <Text style={[styles.leadValue, { color: colors.textPrimary }]}>{totalGames}</Text>
          </View>
          <View style={styles.leadDivider} />
          <View style={styles.leaderboardRow}>
            <Text style={[styles.leadLabel, { color: colors.textPrimary }]}>Total Lifetime Points</Text>
            <Text style={[styles.leadValue, { color: colors.textPrimary }]}>{totalScore}</Text>
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
    paddingBottom: 60,
  },
  milestoneBox: {
    padding: 20,
    borderRadius: UI_STYLES.borderRadius.md,
    marginBottom: 28,
  },
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  milestoneTitle: {
    fontSize: 12,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "700",
    letterSpacing: 1,
  },
  milestoneRecord: {
    fontSize: 36,
    fontFamily: UI_STYLES.fontFamily.mono,
    fontWeight: "800",
    marginBottom: 8,
  },
  milestoneSubtitle: {
    fontSize: 12,
    fontFamily: UI_STYLES.fontFamily.regular,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  skinsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  skinCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: UI_STYLES.borderRadius.md,
  },
  skinVisuals: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    width: 60,
    justifyContent: "center",
  },
  circleHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  circleBody: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  skinInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  skinName: {
    fontSize: 14,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "700",
    marginBottom: 4,
  },
  skinDesc: {
    fontSize: 11,
    fontFamily: UI_STYLES.fontFamily.regular,
    lineHeight: 14,
    marginBottom: 4,
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  lockBadgeText: {
    color: "#FF3366",
    fontSize: 10,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "600",
  },
  skinStatus: {
    paddingHorizontal: 4,
  },
  leaderboardBox: {
    borderRadius: UI_STYLES.borderRadius.md,
    padding: 16,
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  leadLabel: {
    fontSize: 13,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "500",
  },
  leadValue: {
    fontSize: 15,
    fontFamily: UI_STYLES.fontFamily.mono,
    fontWeight: "700",
  },
  leadDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
});
