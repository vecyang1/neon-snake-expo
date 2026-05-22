import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Position } from "../game/GameBoard";
import { FoodItem } from "../game/Food";
import { ThemeColors, UI_STYLES } from "../styles/theme";

interface GameGridProps {
  gridWidth: number;
  gridHeight: number;
  snake: Position[];
  food: FoodItem | null;
  obstacles: Position[];
  colors: ThemeColors;
  boardWidth: number;
  boardHeight: number;
  cellSize: number;
}

export const GameGrid: React.FC<GameGridProps> = ({
  gridWidth,
  gridHeight,
  snake,
  food,
  obstacles,
  colors,
  boardWidth,
  boardHeight,
  cellSize,
}) => {
  // Render grid lines absolutely
  const gridLines = [];
  
  // Vertical lines
  for (let i = 1; i < gridWidth; i++) {
    gridLines.push(
      <View
        key={`v-${i}`}
        style={{
          position: "absolute",
          left: i * cellSize,
          top: 0,
          bottom: 0,
          width: 0.5,
          backgroundColor: colors.gridLine,
        }}
      />
    );
  }

  // Horizontal lines
  for (let j = 1; j < gridHeight; j++) {
    gridLines.push(
      <View
        key={`h-${j}`}
        style={{
          position: "absolute",
          top: j * cellSize,
          left: 0,
          right: 0,
          height: 0.5,
          backgroundColor: colors.gridLine,
        }}
      />
    );
  }

  // Snake Head
  const head = snake[0];
  const headElement = head && (
    <View
      key="head"
      style={{
        position: "absolute",
        left: head.x * cellSize,
        top: head.y * cellSize,
        width: cellSize,
        height: cellSize,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <View
        style={[
          {
            width: "90%",
            height: "90%",
            backgroundColor: colors.snakeHead,
            borderRadius: cellSize / 3,
            transform: [{ scale: 1.05 }],
          },
          UI_STYLES.shadows.glow(colors.snakeHead),
        ]}
      />
    </View>
  );

  // Snake Body
  const bodyElements = snake.slice(1).map((seg, idx) => {
    const segmentIndex = idx + 1;
    const opacity = Math.max(0.4, 1 - segmentIndex / snake.length);
    return (
      <View
        key={`body-${segmentIndex}-${seg.x}-${seg.y}`}
        style={{
          position: "absolute",
          left: seg.x * cellSize,
          top: seg.y * cellSize,
          width: cellSize,
          height: cellSize,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <View
          style={{
            width: "90%",
            height: "90%",
            backgroundColor: colors.snakeBody,
            borderRadius: cellSize / 4,
            opacity: opacity,
            transform: [{ scale: 0.9 }],
          }}
        />
      </View>
    );
  });

  // Food
  const foodElement = food && (
    <View
      key="food"
      style={{
        position: "absolute",
        left: food.position.x * cellSize,
        top: food.position.y * cellSize,
        width: cellSize,
        height: cellSize,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 8,
      }}
    >
      <View
        style={[
          {
            width: "90%",
            height: "90%",
            backgroundColor: food.color || colors.foodRegular,
            borderRadius: cellSize / 2,
            transform: [{ scale: 0.85 }],
          },
          UI_STYLES.shadows.glow(food.color || colors.foodRegular),
        ]}
      />
    </View>
  );

  // Obstacles
  const obstacleElements = obstacles.map((block, idx) => (
    <View
      key={`obstacle-${idx}-${block.x}-${block.y}`}
      style={{
        position: "absolute",
        left: block.x * cellSize,
        top: block.y * cellSize,
        width: cellSize,
        height: cellSize,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4,
      }}
    >
      <View
        style={{
          width: "90%",
          height: "90%",
          backgroundColor: colors.obstacle,
          borderColor: "rgba(255, 255, 255, 0.2)",
          borderWidth: 1,
          borderRadius: 2,
        }}
      />
    </View>
  ));

  return (
    <View
      style={[
        styles.boardContainer,
        {
          width: boardWidth,
          height: boardHeight,
          backgroundColor: colors.background,
          borderColor: colors.accent,
          borderWidth: 1.5,
          ...UI_STYLES.shadows.glow(colors.accent),
        },
      ]}
    >
      {gridLines}
      {obstacleElements}
      {bodyElements}
      {headElement}
      {foodElement}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    borderRadius: UI_STYLES.borderRadius.md,
    overflow: "hidden",
    position: "relative",
  },
});

