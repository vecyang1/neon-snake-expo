import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Vibration,
  Dimensions,
} from "react-native";
import { ThemeColors, UI_STYLES } from "../styles/theme";
import { useGameEngine, GameMode } from "../game/useGameEngine";
import { GameGrid } from "../components/GameGrid";
import { Button } from "../components/Button";
import { Direction } from "../game/Snake";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Calculate grid cells and board size dynamically
const BOARD_PADDING = 20;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 26; // Optimized height to fit controls nicely

interface GameScreenProps {
  colors: ThemeColors;
  mode: GameMode;
  controlType: "SWIPE" | "DPAD" | "BOTH";
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  activeSkinColors?: { head: string; body: string };
  onExit: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  colors,
  mode,
  controlType,
  hapticsEnabled,
  soundEnabled,
  activeSkinColors,
  onExit,
}) => {
  // Cell size calculation to fit the device perfectly
  const availableWidth = SCREEN_WIDTH - BOARD_PADDING * 2;
  const cellSize = Math.floor(availableWidth / GRID_WIDTH);
  const boardWidth = cellSize * GRID_WIDTH;
  const boardHeight = cellSize * GRID_HEIGHT;

  // Track finger touch positions for swipes
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const minSwipeDistance = 30;

  // Vibration feedback helpers
  const triggerHaptic = (type: "eat" | "collide" | "tick") => {
    if (!hapticsEnabled) return;
    try {
      if (type === "eat") {
        Vibration.vibrate(25); // Subtle bump
      } else if (type === "collide") {
        Vibration.vibrate([0, 80, 50, 120]); // Heavy crash vibration pattern
      }
    } catch (e) {
      console.warn("Haptics vibration error", e);
    }
  };

  // Initialize Game Loop Hook
  const {
    snake,
    food,
    isPlaying,
    isPaused,
    isGameOver,
    score,
    highScore,
    foodEatenCount,
    gameTimeLeft,
    obstacles,
    startGame,
    pauseGame,
    resumeGame,
    changeDirection,
  } = useGameEngine(mode, GRID_WIDTH, GRID_HEIGHT, {
    onEatFood: (foodItem) => {
      triggerHaptic("eat");
    },
    onCollide: () => {
      triggerHaptic("collide");
    },
    onGameOver: (finalScore, isNewHighScore) => {
      // Game over handling
    },
  });

  // Start the game loop automatically on mount
  useEffect(() => {
    startGame();
  }, []);

  // Gesture Handlers (Pure JS, no library dependencies, bulletproof compile)
  const handleTouchStart = (e: any) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
  };

  const handleTouchEnd = (e: any) => {
    if (controlType === "DPAD") return; // Skip swipe logic if set to D-Pad only

    const touchEndX = e.nativeEvent.pageX;
    const touchEndY = e.nativeEvent.pageY;

    const dx = touchEndX - touchStartX.current;
    const dy = touchEndY - touchStartY.current;

    // Detect longest delta to decide direction
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (Math.abs(dx) > minSwipeDistance) {
        if (dx > 0) {
          changeDirection("RIGHT");
        } else {
          changeDirection("LEFT");
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(dy) > minSwipeDistance) {
        if (dy > 0) {
          changeDirection("DOWN");
        } else {
          changeDirection("UP");
        }
      }
    }
  };

  // Override snake skin colors if custom cosmetic is active
  const overriddenColors = {
    ...colors,
    snakeHead: activeSkinColors?.head || colors.snakeHead,
    snakeBody: activeSkinColors?.body || colors.snakeBody,
  };

  const showDpad = controlType === "DPAD" || controlType === "BOTH";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top HUD Bar */}
      <View style={styles.hudContainer}>
        <TouchableOpacity activeOpacity={0.8} onPress={pauseGame} style={styles.pauseBtn}>
          <Ionicons name="pause" size={20} color={colors.accent} />
        </TouchableOpacity>

        {/* Dynamic Display Columns */}
        <View style={styles.hudMetrics}>
          <View style={styles.hudMetric}>
            <Text style={[styles.hudLabel, { color: colors.textSecondary }]}>SCORE</Text>
            <Text style={[styles.hudValue, { color: colors.accent }]}>{score}</Text>
          </View>

          {mode === "TIME_ATTACK" ? (
            <View style={styles.hudMetric}>
              <Text style={[styles.hudLabel, { color: "#FF3366" }]}>TIME</Text>
              <Text style={[styles.hudValue, { color: "#FF3366" }]}>{gameTimeLeft}s</Text>
            </View>
          ) : (
            <View style={styles.hudMetric}>
              <Text style={[styles.hudLabel, { color: colors.textSecondary }]}>BEST</Text>
              <Text style={[styles.hudValue, { color: colors.textPrimary }]}>{highScore}</Text>
            </View>
          )}

          <View style={styles.hudMetric}>
            <Text style={[styles.hudLabel, { color: colors.textSecondary }]}>FOOD</Text>
            <Text style={[styles.hudValue, { color: colors.textPrimary }]}>{foodEatenCount}</Text>
          </View>
        </View>
      </View>

      {/* Main Grid Area (Wrapped with swipe touch listeners) */}
      <View
        style={styles.gridOuterFrame}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <GameGrid
          gridWidth={GRID_WIDTH}
          gridHeight={GRID_HEIGHT}
          snake={snake}
          food={food}
          obstacles={obstacles}
          colors={overriddenColors}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          cellSize={cellSize}
        />
        {controlType === "SWIPE" && (
          <Text style={[styles.swipeHelp, { color: colors.textSecondary }]}>
            SWIPE TO CONTROL SNAKE
          </Text>
        )}
      </View>

      {/* Floating Glassmorphic D-PAD */}
      {showDpad && (
        <View style={styles.dpadContainer}>
          <View style={styles.dpadRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => changeDirection("UP")}
              style={[
                styles.dpadKey,
                { backgroundColor: colors.glassBackground, borderColor: "rgba(255,255,255,0.06)" },
              ]}
            >
              <Ionicons name="chevron-up" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <View style={styles.dpadRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => changeDirection("LEFT")}
              style={[
                styles.dpadKey,
                { backgroundColor: colors.glassBackground, borderColor: "rgba(255,255,255,0.06)" },
              ]}
            >
              <Ionicons name="chevron-back" size={24} color={colors.accent} />
            </TouchableOpacity>
            <View style={styles.dpadSpacer} />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => changeDirection("RIGHT")}
              style={[
                styles.dpadKey,
                { backgroundColor: colors.glassBackground, borderColor: "rgba(255,255,255,0.06)" },
              ]}
            >
              <Ionicons name="chevron-forward" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <View style={styles.dpadRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => changeDirection("DOWN")}
              style={[
                styles.dpadKey,
                { backgroundColor: colors.glassBackground, borderColor: "rgba(255,255,255,0.06)" },
              ]}
            >
              <Ionicons name="chevron-down" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pause Modal */}
      <Modal visible={isPaused} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(8, 8, 12, 0.85)" }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.accent, borderWidth: 1 },
              UI_STYLES.shadows.glow(colors.accent),
            ]}
          >
            <Ionicons name="pause-circle-outline" size={48} color={colors.accent} style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>GAME PAUSED</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Mode: {mode.replace("_", " ")} | Current Score: {score}
            </Text>

            <View style={styles.modalButtons}>
              <Button label="RESUME GAME" colors={colors} variant="primary" onPress={resumeGame} />
              <Button label="RESTART GAME" colors={colors} variant="glass" onPress={startGame} />
              <Button label="QUIT TO MENU" colors={colors} variant="secondary" onPress={onExit} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Game Over Modal */}
      <Modal visible={isGameOver} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(8, 8, 12, 0.9)" }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.cardBackground, borderColor: "#FF3366", borderWidth: 1 },
              UI_STYLES.shadows.glow("#FF3366"),
            ]}
          >
            <Ionicons name="skull-outline" size={48} color="#FF3366" style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary, textShadowColor: "#FF3366", textShadowRadius: 8 }]}>
              GAME OVER
            </Text>
            
            <View style={styles.gameOverStats}>
              <View style={styles.statLine}>
                <Text style={[styles.statLineLabel, { color: colors.textSecondary }]}>Final Score:</Text>
                <Text style={[styles.statLineValue, { color: colors.accent }]}>{score}</Text>
              </View>
              <View style={styles.statLine}>
                <Text style={[styles.statLineLabel, { color: colors.textSecondary }]}>Food Eaten:</Text>
                <Text style={[styles.statLineValue, { color: colors.textPrimary }]}>{foodEatenCount}</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button label="PLAY AGAIN" colors={colors} variant="primary" onPress={startGame} />
              <Button label="EXIT TO LOBBY" colors={colors} variant="secondary" onPress={onExit} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hudContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  pauseBtn: {
    padding: 8,
    borderRadius: UI_STYLES.borderRadius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  hudMetrics: {
    flexDirection: "row",
    gap: 20,
  },
  hudMetric: {
    alignItems: "flex-end",
  },
  hudLabel: {
    fontSize: 9,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  hudValue: {
    fontSize: 16,
    fontFamily: UI_STYLES.fontFamily.mono,
    fontWeight: "700",
  },
  gridOuterFrame: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  swipeHelp: {
    fontSize: 10,
    fontFamily: UI_STYLES.fontFamily.mono,
    letterSpacing: 2,
    marginTop: 12,
    opacity: 0.5,
  },
  dpadContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 4,
  },
  dpadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  dpadKey: {
    width: 58,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dpadSpacer: {
    width: 46,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: UI_STYLES.borderRadius.lg,
    padding: 28,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: UI_STYLES.fontFamily.bold,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    fontFamily: UI_STYLES.fontFamily.regular,
    marginBottom: 24,
  },
  modalButtons: {
    width: "100%",
    gap: 12,
  },
  gameOverStats: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: UI_STYLES.borderRadius.md,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  statLine: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statLineLabel: {
    fontSize: 14,
    fontFamily: UI_STYLES.fontFamily.bold,
  },
  statLineValue: {
    fontSize: 16,
    fontFamily: UI_STYLES.fontFamily.mono,
    fontWeight: "700",
  },
});
