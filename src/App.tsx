import { useRef, useState } from "react";
import "./App.css";
import { Grid, GRID_PADDING, TILE_SIZE } from "./objects/Grid";
import Box from "@mui/material/Box";
import { Header } from "./components/Header";
import { GameStartScreen } from "./components/GameStartScreen";
import { GameControls } from "./components/GameControls";
import { WinModal, SolutionModal } from "./components/Modals";
import { GameModeModal } from "./components/GameModeModal";
import { useGameActions } from "./hooks/useGameActions";
import {
  useCanvasSetup,
  useRedraw,
  useInitialDraw,
  useKaleidoscopeEffect,
} from "./hooks/useCanvasEffects";
import {
  useGameTimer,
  useKeyboardControls,
  useResponsiveLayout,
} from "./hooks/useGameState";
import { MAX_PUZZLE_NUMBER } from "./utils/gameUtils";

function App() {
  // Grid reference
  const grid = useRef<Grid>(new Grid());

  // Game state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModeModal, setShowModeModal] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [puzzleNumber, setPuzzleNumber] = useState<string>("");
  const [canGoToNextShape, setCanGoToNextShape] = useState<boolean>(true);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [isLastShape, setIsLastShape] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Layout state
  const [dynamicTileSize, setDynamicTileSize] = useState<number>(TILE_SIZE);
  const [dynamicPadding, setDynamicPadding] = useState<number>(GRID_PADDING);
  const [gridSize, setGridSize] = useState<number>(0);
  const [useVerticalControlLayout, setUseVerticalControlLayout] =
    useState<boolean>(false);
  const [controlSpacing, setControlSpacing] = useState<{
    inner: number;
    outer: number;
  }>({
    inner: 1,
    outer: 3,
  });

  // Custom hooks for canvas rendering
  const redraw = useRedraw({
    dynamicTileSize,
    dynamicPadding,
    setCanGoToNextShape,
    setCanUndo,
    setIsLastShape,
  });

  useCanvasSetup({ dynamicTileSize, dynamicPadding, grid });
  useInitialDraw({ grid, redraw });
  useKaleidoscopeEffect({
    hasWon,
    grid,
    dynamicTileSize,
    dynamicPadding,
    redraw,
    setShowWinModal,
  });

  // Custom hooks for game actions
  const gameActions = useGameActions({
    grid,
    redraw,
    setHasWon,
  });

  // Custom hooks for game state management
  useGameTimer({ gameStarted, hasWon, setElapsedTime });
  useKeyboardControls({
    gameStarted,
    hasWon,
    rotateActiveShape: gameActions.rotateActiveShape,
    flipActiveShape: gameActions.flipActiveShape,
    nextShape: gameActions.nextShape,
    moveActiveShape: gameActions.moveActiveShape,
    undo: gameActions.undo,
  });
  useResponsiveLayout({
    setDynamicTileSize,
    setDynamicPadding,
    setGridSize,
    setUseVerticalControlLayout,
    setControlSpacing,
  });

  // Game lifecycle handlers
  const startGame = async () => {
    setIsLoading(true);
    try {
      const puzzleNum = parseInt(puzzleNumber);
      if (puzzleNumber && !isNaN(puzzleNum)) {
        if (puzzleNum < 1 || puzzleNum > MAX_PUZZLE_NUMBER) {
          setIsLoading(false);
          return;
        }
        await grid.current.startGameWithPuzzleIndex(puzzleNum);
      } else {
        await grid.current.startGame(difficulty);
      }
      setGameStarted(true);
      redraw(grid);
    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const restartGame = () => {
    setGameStarted(false);
    setHasWon(false);
    setElapsedTime(0);
    setCanGoToNextShape(true);
    setCanUndo(false);
    setIsLastShape(false);
    setShowSolutionModal(false);
    setShowWinModal(false);
    setPuzzleNumber("");
    setShowModeModal(true);
    gameActions.restartGame();
  };

  const handleModeSelect = (mode: "daily" | "freeplay") => {
    setShowModeModal(false);
    // Daily mode not implemented yet, only freeplay works
    if (mode === "freeplay") {
      // User can now see the game start screen
    }
  };

  const closeSolutionModal = () => {
    setShowSolutionModal(false);
  };

  return (
    <>
      <Header
        onAutoComplete={gameActions.autoComplete}
        onRestart={restartGame}
        gameStarted={gameStarted}
        showModeModal={showModeModal}
      />

      <Box sx={{ position: "relative", display: "inline-block" }}>
        <canvas id="canvas-grid"></canvas>

        {/* Game Mode Modal */}
        {showModeModal && !gameStarted && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <GameModeModal onSelectMode={handleModeSelect} />
          </Box>
        )}
      </Box>

      <div
        className="controls-container"
        style={{
          maxWidth: gridSize > 0 ? `${gridSize}px` : "420px",
          minWidth: "320px",
        }}
      >
        {!gameStarted && !hasWon && !showModeModal && (
          <GameStartScreen
            puzzleNumber={puzzleNumber}
            setPuzzleNumber={setPuzzleNumber}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            isLoading={isLoading}
            onStartGame={() => void startGame()}
          />
        )}

        {gameStarted && !hasWon && (
          <GameControls
            puzzleIndex={grid.current.getPuzzleIndex()}
            difficultyLabel={grid.current.getDifficulty()}
            elapsedTime={elapsedTime}
            canGoToNextShape={canGoToNextShape}
            canUndo={canUndo}
            isLastShape={isLastShape}
            controlSpacing={controlSpacing}
            useVerticalControlLayout={useVerticalControlLayout}
            onNextShape={gameActions.nextShape}
            onUndo={gameActions.undo}
            onMoveActiveShape={gameActions.moveActiveShape}
            onRotateActiveShape={gameActions.rotateActiveShape}
            onFlipActiveShape={gameActions.flipActiveShape}
          />
        )}

        {showSolutionModal && (
          <SolutionModal
            show={showSolutionModal}
            solutionShapes={grid.current?.getSolutionShapes() || []}
            onClose={closeSolutionModal}
          />
        )}

        {showWinModal && (
          <WinModal
            show={showWinModal}
            elapsedTime={elapsedTime}
            puzzleIndex={grid.current.getPuzzleIndex()}
            difficulty={grid.current.getDifficulty()}
            onPlayAgain={restartGame}
          />
        )}
      </div>
    </>
  );
}

export default App;
