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
  // Check if a position matches any element
  const isSnakeHead = (x: number, y: number) => {
    return snake.length > 0 && snake[0].x === x && snake[0].y === y;
  };

  const isSnakeBody = (x: number, y: number) => {
    if (snake.length <= 1) return false;
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === x && snake[i].y === y) return true;
    }
    return false;
  };

  const isFood = (x: number, y: number) => {
    return food !== null && food.position.x === x && food.position.y === y;
  };

  const isObstacle = (x: number, y: number) => {
    return obstacles.some(block => block.x === x && block.y === y);
  };

  // Build grid matrix dynamically
  const cells = [];
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      let cellStyle: any = null;
      let glowStyle: any = null;

      if (isSnakeHead(x, y)) {
        cellStyle = {
          backgroundColor: colors.snakeHead,
          borderRadius: cellSize / 3,
          transform: [{ scale: 1.05 }],
          zIndex: 10,
        };
        glowStyle = UI_STYLES.shadows.glow(colors.snakeHead);
      } else if (isSnakeBody(x, y)) {
        // Find body index to apply smooth gradient fade
        const idx = snake.findIndex(seg => seg.x === x && seg.y === y);
        const opacity = Math.max(0.4, 1 - idx / snake.length);
        cellStyle = {
          backgroundColor: colors.snakeBody,
          borderRadius: cellSize / 4,
          opacity: opacity,
          transform: [{ scale: 0.9 }],
          zIndex: 5,
        };
      } else if (isFood(x, y)) {
        cellStyle = {
          backgroundColor: food?.color || colors.foodRegular,
          borderRadius: cellSize / 2, // Perfect circle
          transform: [{ scale: 0.85 }],
          zIndex: 8,
        };
        glowStyle = UI_STYLES.shadows.glow(food?.color || colors.foodRegular);
      } else if (isObstacle(x, y)) {
        cellStyle = {
          backgroundColor: colors.obstacle,
          borderColor: "rgba(255, 255, 255, 0.2)",
          borderWidth: 1,
          borderRadius: 2,
          zIndex: 4,
        };
      }

      cells.push(
        <View
          key={`${x}-${y}`}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              borderColor: colors.gridLine,
              borderWidth: 0.5,
            },
          ]}
        >
          {cellStyle && (
            <View
              style={[
                styles.itemContainer,
                cellStyle,
                glowStyle,
              ]}
            />
          )}
        </View>
      );
    }
  }

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
      {cells}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: UI_STYLES.borderRadius.md,
    overflow: "hidden",
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    width: "90%",
    height: "90%",
  },
});
