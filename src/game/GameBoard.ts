export interface Position {
  x: number;
  y: number;
}

export class GameBoard {
  public readonly gridWidth: number;
  public readonly gridHeight: number;

  constructor(width = 20, height = 30) {
    this.gridWidth = width;
    this.gridHeight = height;
  }

  /**
   * Checks if a position is within the board boundaries
   */
  public isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.gridWidth &&
      position.y >= 0 &&
      position.y < this.gridHeight
    );
  }

  /**
   * Checks if a position is on the outer boundary of the board
   */
  public isPositionOnBoundary(position: Position): boolean {
    return (
      position.x === 0 ||
      position.x === this.gridWidth - 1 ||
      position.y === 0 ||
      position.y === this.gridHeight - 1
    );
  }

  /**
   * Gets a random position on the board
   */
  public getRandomPosition(): Position {
    const x = Math.floor(Math.random() * this.gridWidth);
    const y = Math.floor(Math.random() * this.gridHeight);
    return { x, y };
  }

  /**
   * Gets the center cell position of the board
   */
  public getCenterPosition(): Position {
    return {
      x: Math.floor(this.gridWidth / 2),
      y: Math.floor(this.gridHeight / 2),
    };
  }

  /**
   * Wraps a position around the boundaries for wrapping/endless mode
   */
  public wrapPosition(position: Position): Position {
    const wrapped = { ...position };

    if (wrapped.x < 0) {
      wrapped.x = this.gridWidth - 1;
    } else if (wrapped.x >= this.gridWidth) {
      wrapped.x = 0;
    }

    if (wrapped.y < 0) {
      wrapped.y = this.gridHeight - 1;
    } else if (wrapped.y >= this.gridHeight) {
      wrapped.y = 0;
    }

    return wrapped;
  }

  public get totalCells(): number {
    return this.gridWidth * this.gridHeight;
  }
}
