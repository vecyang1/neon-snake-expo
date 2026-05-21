import { Position } from "./GameBoard";

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

export class Snake {
  public body: Position[];
  public direction: Direction;
  private nextDirection: Direction | null = null;

  constructor(startPosition: Position) {
    this.body = [startPosition];
    this.direction = "RIGHT";
  }

  public get head(): Position {
    return this.body[0] || { x: 0, y: 0 };
  }

  public get tail(): Position {
    return this.body[this.body.length - 1] || { x: 0, y: 0 };
  }

  public get length(): number {
    return this.body.length;
  }

  /**
   * Moves the snake head in the current direction.
   * If there's a buffered direction change, it applies it first.
   */
  public move(): void {
    if (this.nextDirection && this.canChangeDirection(this.nextDirection)) {
      this.direction = this.nextDirection;
      this.nextDirection = null;
    }

    const currentHead = this.head;
    const newHead = { ...currentHead };

    switch (this.direction) {
      case "UP":
        newHead.y -= 1;
        break;
      case "DOWN":
        newHead.y += 1;
        break;
      case "LEFT":
        newHead.x -= 1;
        break;
      case "RIGHT":
        newHead.x += 1;
        break;
    }

    // Insert new head at the beginning
    this.body.unshift(newHead);
  }

  /**
   * Trims the tail segment (used when snake moves normally without eating food)
   */
  public removeTail(): void {
    if (this.body.length > 1) {
      this.body.pop();
    }
  }

  /**
   * Queue a direction change.
   * If the snake is length 1, we change direction instantly.
   * Otherwise, we buffer it to execute on the next tick to prevent rapid double-taps causing self-collision.
   */
  public changeDirection(newDirection: Direction): void {
    if (this.canChangeDirection(newDirection)) {
      if (this.body.length === 1) {
        this.direction = newDirection;
      } else {
        this.nextDirection = newDirection;
      }
    }
  }

  /**
   * Determines if the snake can change to a given direction (cannot do immediate 180s)
   */
  private canChangeDirection(newDirection: Direction): boolean {
    return newDirection !== OPPOSITE_DIRECTIONS[this.direction];
  }

  /**
   * Checks if the head collides with any body segments
   */
  public willCollideWithSelf(): boolean {
    if (this.body.length <= 1) return false;
    const head = this.head;
    
    // Check if head position matches any body segment (excluding head itself)
    for (let i = 1; i < this.body.length; i++) {
      if (this.body[i].x === head.x && this.body[i].y === head.y) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if a specific position is occupied by any segment of the snake
   */
  public occupiesPosition(position: Position): boolean {
    return this.body.some(segment => segment.x === position.x && segment.y === position.y);
  }
}
