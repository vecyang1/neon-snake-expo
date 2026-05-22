import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameBoard, Position } from "./GameBoard";
import { Snake, Direction } from "./Snake";
import { FoodGenerator, FoodItem } from "./Food";

export type GameMode = "CLASSIC" | "ENDLESS" | "TIME_ATTACK" | "MAZE";

export interface GameStats {
  score: number;
  foodEaten: number;
  timeElapsed: number;
  highScore: number;
}

export const INITIAL_SPEED = 300; // ms
export const SPEED_DECREMENT = 10;
export const MIN_SPEED = 50;

// Keys for statistics persistence
const KEYS = {
  classicHighScore: "@snake_classic_highscore",
  endlessHighScore: "@snake_endless_highscore",
  timeAttackHighScore: "@snake_time_attack_highscore",
  mazeHighScore: "@snake_maze_highscore",
  totalGamesPlayed: "@snake_total_games",
  totalScore: "@snake_total_score",
  totalFoodEaten: "@snake_total_food",
};

export const useGameEngine = (
  mode: GameMode = "CLASSIC",
  gridWidth = 20,
  gridHeight = 30,
  callbacks?: {
    onEatFood?: (food: FoodItem) => void;
    onCollide?: () => void;
    onGameOver?: (score: number, isNewHighScore: boolean) => void;
    onStart?: () => void;
  }
) => {
  const [board] = useState(() => new GameBoard(gridWidth, gridHeight));
  const [snake, setSnake] = useState<Position[]>([]);
  const [food, setFood] = useState<FoodItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [foodEatenCount, setFoodEatenCount] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(60); // Used in TIME_ATTACK mode

  // Ref variables to avoid re-triggering effects on state changes
  const snakeRef = useRef<Snake | null>(null);
  const foodGeneratorRef = useRef<FoodGenerator | null>(null);
  const loopIntervalRef = useRef<any>(null);
  const timeAttackIntervalRef = useRef<any>(null);
  const speedRef = useRef(INITIAL_SPEED);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const scoreRef = useRef(0);
  const currentModeRef = useRef(mode);

  // Sync food state into a ref for the game loop to avoid dependency changes
  const foodRef = useRef<FoodItem | null>(null);
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  // Sync obstacles state into a ref
  const [obstacles, setObstacles] = useState<Position[]>([]);
  const obstaclesRef = useRef<Position[]>([]);
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  // Stabilize callbacks using ref
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Update current mode ref
  useEffect(() => {
    currentModeRef.current = mode;
  }, [mode]);

  // Load high scores on mount/mode change
  useEffect(() => {
    const loadHighScore = async () => {
      let key = KEYS.classicHighScore;
      if (mode === "ENDLESS") key = KEYS.endlessHighScore;
      if (mode === "TIME_ATTACK") key = KEYS.timeAttackHighScore;
      if (mode === "MAZE") key = KEYS.mazeHighScore;

      try {
        const val = await AsyncStorage.getItem(key);
        if (val) {
          setHighScore(parseInt(val, 10));
        } else {
          setHighScore(0);
        }
      } catch (err) {
        console.warn("Error loading high score", err);
      }
    };
    loadHighScore();
  }, [mode]);

  // Generate obstacles for MAZE mode
  useEffect(() => {
    if (mode === "MAZE") {
      const mazeBlocks: Position[] = [];
      // Draw horizontal barrier in center top
      for (let x = 4; x < gridWidth - 4; x++) {
        if (x !== Math.floor(gridWidth / 2)) {
          mazeBlocks.push({ x, y: 7 });
          mazeBlocks.push({ x, y: gridHeight - 8 });
        }
      }
      // Vertical pillars
      mazeBlocks.push({ x: 4, y: 14 });
      mazeBlocks.push({ x: 4, y: 15 });
      mazeBlocks.push({ x: gridWidth - 5, y: 14 });
      mazeBlocks.push({ x: gridWidth - 5, y: 15 });
      setObstacles(mazeBlocks);
    } else {
      setObstacles([]);
    }
  }, [mode, gridWidth, gridHeight]);

  // Game termination helper (completely stable dependency array)
  const endGame = useCallback(async (reason: string = "unspecified") => {
    console.log(`[GameEngine] endGame called. Reason: ${reason}, Score: ${scoreRef.current}`);
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsGameOver(true);
    setGameOverReason(reason);

    if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
    if (timeAttackIntervalRef.current) clearInterval(timeAttackIntervalRef.current);

    const currentMode = currentModeRef.current;
    let key = KEYS.classicHighScore;
    if (currentMode === "ENDLESS") key = KEYS.endlessHighScore;
    if (currentMode === "TIME_ATTACK") key = KEYS.timeAttackHighScore;
    if (currentMode === "MAZE") key = KEYS.mazeHighScore;

    const finalScore = scoreRef.current;
    let isNewHighScore = false;

    try {
      // Save stats
      const currentHighVal = await AsyncStorage.getItem(key);
      const currentHigh = currentHighVal ? parseInt(currentHighVal, 10) : 0;
      
      if (finalScore > currentHigh) {
        await AsyncStorage.setItem(key, finalScore.toString());
        setHighScore(finalScore);
        isNewHighScore = true;
      }

      // Increment total games
      const totalGamesVal = await AsyncStorage.getItem(KEYS.totalGamesPlayed);
      const totalGames = totalGamesVal ? parseInt(totalGamesVal, 10) : 0;
      await AsyncStorage.setItem(KEYS.totalGamesPlayed, (totalGames + 1).toString());

      // Update total score
      const totalScoreVal = await AsyncStorage.getItem(KEYS.totalScore);
      const totalScore = totalScoreVal ? parseInt(totalScoreVal, 10) : 0;
      await AsyncStorage.setItem(KEYS.totalScore, (totalScore + finalScore).toString());
    } catch (err) {
      console.warn("Error saving stats", err);
    }

    callbacksRef.current?.onGameOver?.(finalScore, isNewHighScore);
  }, []);

  // Periodic Game Step Loop (completely stable: depends only on board and endGame)
  const gameStep = useCallback(() => {
    if (!isPlayingRef.current || isPausedRef.current || !snakeRef.current) return;

    const currentSnake = snakeRef.current;
    
    // Move snake head forward
    currentSnake.move();
    
    const head = currentSnake.head;
    console.log(`[GameStep] Head: (${head.x}, ${head.y}), Dir: ${currentSnake.direction}, NextDir: ${(currentSnake as any).nextDirection}`);
    const currentMode = currentModeRef.current;

    // Boundary Collisions
    if (currentMode === "CLASSIC" || currentMode === "TIME_ATTACK" || currentMode === "MAZE") {
      if (!board.isValidPosition(head)) {
        console.log(`[GameEngine] Boundary collision at head x:${head.x}, y:${head.y} (grid: ${board.gridWidth}x${board.gridHeight})`);
        callbacksRef.current?.onCollide?.();
        endGame(`boundary_collision_head_x${head.x}_y${head.y}`);
        return;
      }
    } else if (currentMode === "ENDLESS") {
      if (!board.isValidPosition(head)) {
        const wrapped = board.wrapPosition(head);
        // Apply wrapped position directly
        currentSnake.body[0] = wrapped;
      }
    }

    // Maze Block Obstacle Collisions
    if (currentMode === "MAZE") {
      const hitObstacle = obstaclesRef.current.some(
        block => block.x === currentSnake.head.x && block.y === currentSnake.head.y
      );
      if (hitObstacle) {
        console.log(`[GameEngine] Obstacle collision at head x:${head.x}, y:${head.y}`);
        callbacksRef.current?.onCollide?.();
        endGame(`maze_obstacle_collision_x${head.x}_y${head.y}`);
        return;
      }
    }

    // Self Collision
    if (currentSnake.willCollideWithSelf()) {
      console.log(`[GameEngine] Self collision detected at head x:${head.x}, y:${head.y}`);
      callbacksRef.current?.onCollide?.();
      endGame("self_collision");
      return;
    }

    // Food Consumption
    const currentFoodItem = foodRef.current;
    if (currentFoodItem && head.x === currentFoodItem.position.x && head.y === currentFoodItem.position.y) {
      // Eat food: add score and spawn new
      const points = currentFoodItem.pointValue;
      setScore(prev => {
        const newScore = prev + points;
        scoreRef.current = newScore;
        return newScore;
      });
      setFoodEatenCount(prev => prev + 1);

      // Increase Time in TIME_ATTACK mode (+5 seconds)
      if (currentMode === "TIME_ATTACK") {
        setGameTimeLeft(prev => Math.min(99, prev + 5));
      }

      // Grow Snake (do not pop the tail segment)
      // Gradually speed up
      speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_DECREMENT);
      
      // Spawn new food avoiding snake body
      if (foodGeneratorRef.current) {
        const newFood = foodGeneratorRef.current.generateFood(currentSnake);
        setFood(newFood);
      }

      callbacksRef.current?.onEatFood?.(currentFoodItem);
    } else {
      // Normal step: pop the tail to maintain length
      currentSnake.removeTail();
    }

    // Update state to trigger re-renders
    setSnake([...currentSnake.body]);
  }, [board, endGame]);

  // Restart intervals when speed changes (completely stable)
  const updateLoopSpeed = useCallback(() => {
    if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
    if (isPlayingRef.current && !isPausedRef.current) {
      loopIntervalRef.current = setInterval(gameStep, speedRef.current);
    }
  }, [gameStep]);

  // Start a new game (completely stable)
  const startGame = useCallback(() => {
    if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
    if (timeAttackIntervalRef.current) clearInterval(timeAttackIntervalRef.current);

    const center = board.getCenterPosition();
    const newSnake = new Snake(center);
    const newFoodGenerator = new FoodGenerator(board);
    const newFood = newFoodGenerator.generateFood(newSnake);

    snakeRef.current = newSnake;
    foodGeneratorRef.current = newFoodGenerator;

    setSnake(newSnake.body);
    setFood(newFood);
    setScore(0);
    scoreRef.current = 0;
    setFoodEatenCount(0);
    speedRef.current = INITIAL_SPEED;
    setIsGameOver(false);
    setGameOverReason("");
    setIsPaused(false);
    isPausedRef.current = false;
    
    // Time Attack Configuration
    const currentMode = currentModeRef.current;
    if (currentMode === "TIME_ATTACK") {
      setGameTimeLeft(60);
      timeAttackIntervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          setGameTimeLeft(prev => {
            if (prev <= 1) {
              endGame("time_attack_timeout");
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    setIsPlaying(true);
    isPlayingRef.current = true;
    
    callbacksRef.current?.onStart?.();

    // Start tick loop
    loopIntervalRef.current = setInterval(gameStep, speedRef.current);
  }, [board, gameStep, endGame]);

  // Pause game
  const pauseGame = useCallback(() => {
    if (!isPlayingRef.current || isPausedRef.current) return;
    setIsPaused(true);
    isPausedRef.current = true;
    if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
  }, []);

  // Resume game
  const resumeGame = useCallback(() => {
    if (!isPlayingRef.current || !isPausedRef.current) return;
    setIsPaused(false);
    isPausedRef.current = false;
    loopIntervalRef.current = setInterval(gameStep, speedRef.current);
  }, [gameStep]);

  // Handle Swipe/D-pad Direction Input
  const changeDirection = useCallback((dir: Direction) => {
    if (!isPlayingRef.current || isPausedRef.current || !snakeRef.current) return;
    snakeRef.current.changeDirection(dir);
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
      if (timeAttackIntervalRef.current) clearInterval(timeAttackIntervalRef.current);
    };
  }, []);

  // Sync interval whenever speed changes or is updated
  useEffect(() => {
    updateLoopSpeed();
  }, [updateLoopSpeed]);

  return {
    board,
    snake,
    food,
    isPlaying,
    isPaused,
    isGameOver,
    gameOverReason,
    score,
    highScore,
    foodEatenCount,
    gameTimeLeft,
    obstacles,
    startGame,
    pauseGame,
    resumeGame,
    changeDirection,
  };
};
