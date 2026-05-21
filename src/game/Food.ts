import { Position, GameBoard } from "./GameBoard";
import { Snake } from "./Snake";

export type FoodType = "REGULAR" | "BONUS" | "SPECIAL";

export interface FoodItem {
  position: Position;
  pointValue: number;
  type: FoodType;
  color: string;
}

export const FOOD_CONFIG: Record<FoodType, { pointValue: number; color: string; probability: number }> = {
  REGULAR: {
    pointValue: 10,
    color: "#F44336", // Vivid Red
    probability: 80,
  },
  BONUS: {
    pointValue: 25,
    color: "#FF9800", // Vibrant Orange
    probability: 15,
  },
  SPECIAL: {
    pointValue: 50,
    color: "#9C27B0", // Glowing Neon Purple
    probability: 5,
  },
};

export class FoodGenerator {
  private gameBoard: GameBoard;

  constructor(gameBoard: GameBoard) {
    this.gameBoard = gameBoard;
  }

  /**
   * Generates a new food item at a free position not occupied by the snake
   */
  public generateFood(snake: Snake): FoodItem {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const position = this.gameBoard.getRandomPosition();

      // Ensure position is not occupied by snake body
      if (!snake.occupiesPosition(position)) {
        const type = this.determineFoodType();
        const config = FOOD_CONFIG[type];
        return {
          position,
          type,
          pointValue: config.pointValue,
          color: config.color,
        };
      }
      attempts++;
    }

    // Fallback: search systematically for the first free spot
    for (let y = 0; y < this.gameBoard.gridHeight; y++) {
      for (let x = 0; x < this.gameBoard.gridWidth; x++) {
        const position = { x, y };
        if (!snake.occupiesPosition(position)) {
          const type = "REGULAR";
          const config = FOOD_CONFIG[type];
          return {
            position,
            type,
            pointValue: config.pointValue,
            color: config.color,
          };
        }
      }
    }

    // Edge case fallback
    return {
      position: { x: 0, y: 0 },
      type: "REGULAR",
      pointValue: FOOD_CONFIG.REGULAR.pointValue,
      color: FOOD_CONFIG.REGULAR.color,
    };
  }

  /**
   * Determine food type based on predefined random probability percentages
   */
  private determineFoodType(): FoodType {
    const rand = Math.floor(Math.random() * 100) + 1; // 1 to 100

    if (rand <= 80) {
      return "REGULAR";
    } else if (rand <= 95) {
      return "BONUS";
    } else {
      return "SPECIAL";
    }
  }
}
