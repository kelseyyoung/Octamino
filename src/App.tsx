import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import {
  Grid,
  GRID_PADDING,
  TILE_SIZE,
  type MoveShapeDirection,
} from "./objects/Grid";
import Button from "@mui/material/Button";
import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import {
  CenteredColumnStack,
  CenteredRowStack,
} from "./components/LayoutComponents";
import { ArrowButton } from "./components/ArrowButton";
import { Header } from "./components/Header";
import IconButton from "@mui/material/IconButton";

const tooltipOffset = {
  popper: {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, -10],
        },
      },
    ],
  },
};

// function getTileFromMousePosition(
//   canvas: HTMLCanvasElement,
//   event: MouseEvent
// ) {
//   // Get the mouse position relative to the canvas
//   const rect = canvas.getBoundingClientRect();
//   const mouseX = event.clientX - rect.left - GRID_PADDING;
//   const mouseY = event.clientY - rect.top - GRID_PADDING;

//   // Determine the tile coordinates
//   const tileX = Math.floor(mouseX / TILE_SIZE);
//   const tileY = Math.floor(mouseY / TILE_SIZE);
//   return { x: tileX, y: tileY };
// }

// function handleCursorChange(
//   grid: React.RefObject<Grid>,
//   canvas: HTMLCanvasElement,
//   tile: { x: number; y: number }
// ) {
//   if (grid.current.getActiveShapeAt(tile.x, tile.y) !== null) {
//     // We did a mouse up over the active shape
//     // Set cursor to "grab"
//     canvas.style.cursor = "grab";
//   } else {
//     // Not over the active shape, set cursor to "default"
//     canvas.style.cursor = "default";
//   }
// }

// function tileInBounds(x: number, y: number) {
//   return x >= 0 && x < 8 && y >= 0 && y < 8;
// }

function App() {
  const grid = useRef<Grid>(new Grid());
  // const [dragging, setDragging] = useState<boolean | { x: number; y: number }>(
  //   false
  // );
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
  const [dynamicTileSize, setDynamicTileSize] = useState<number>(TILE_SIZE);
  const [dynamicPadding, setDynamicPadding] = useState<number>(GRID_PADDING);
  const [gridSize, setGridSize] = useState<number>(0); // Track actual grid size
  const [isTallPortrait, setIsTallPortrait] = useState<boolean>(false); // Track tall portrait mode
  const [buttonSize, setButtonSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [controlSpacing, setControlSpacing] = useState<{
    inner: number;
    outer: number;
  }>({ inner: 1, outer: 3 });

  const redraw = useCallback(
    (grid: React.RefObject<Grid>) => {
      const canvas = document.getElementById(
        "canvas-grid"
      ) as HTMLCanvasElement;
      grid.current.draw(canvas, dynamicTileSize, dynamicPadding);
      setCanGoToNextShape(!grid.current.hasOverlappingShapes());
      setCanUndo(grid.current.getShapes().length > 1);
      setIsLastShape(grid.current.getShapes().length === 8);
    },
    [dynamicTileSize, dynamicPadding]
  );

  const startGame = async () => {
    setIsLoading(true);
    try {
      // If puzzleNumber is provided and valid, use it; otherwise use difficulty
      const puzzleNum = parseInt(puzzleNumber);
      if (puzzleNumber && !isNaN(puzzleNum)) {
        if (puzzleNum < 1 || puzzleNum > 62642) {
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

  const rotateActiveShape = useCallback(
    (clockwise: boolean) => {
      grid.current.rotateActiveShape(clockwise);
      redraw(grid);
    },
    [redraw]
  );

  const flipActiveShape = useCallback(
    (horizontal: boolean) => {
      grid.current.flipActiveShape(horizontal);
      redraw(grid);
    },
    [redraw]
  );

  const nextShape = useCallback(() => {
    if (grid.current.hasWon()) {
      setHasWon(true);
      redraw(grid);
      return;
    }
    if (!grid.current.hasOverlappingShapes()) {
      grid.current.addShape();
    }
    // Always redraw to re-evaluate button states after attempting to add shape
    redraw(grid);
  }, [redraw]);

  const moveActiveShape = useCallback(
    (direction: MoveShapeDirection) => {
      grid.current.moveActiveShape(direction);
      redraw(grid);
    },
    [redraw]
  );

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setDifficulty(event.target.value as "easy" | "medium" | "hard");
  };

  const undo = () => {
    grid.current.undo();
    redraw(grid);
  };

  // const showSolution = () => {
  //   setShowSolutionModal(true);
  // };

  const closeSolutionModal = () => {
    setShowSolutionModal(false);
  };

  const autoComplete = () => {
    grid.current.autoComplete();
    setHasWon(true);
    redraw(grid);
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
    grid.current = new Grid();
    redraw(grid);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderSolutionTable = (useActualShapes: boolean = false) => {
    const solutionShapes = useActualShapes
      ? grid.current?.getShapes() || []
      : grid.current?.getSolutionShapes() || [];
    if (solutionShapes.length === 0) return null;

    // Create an 8x8 grid map to store which color belongs to each cell
    const gridMap: (string | null)[][] = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => null)
    );

    // Fill the grid map with colors from each shape
    solutionShapes.forEach((shape) => {
      shape.getTiles().forEach((tile) => {
        const x = tile.getX();
        const y = tile.getY();
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
          gridMap[y][x] = shape.getColor();
        }
      });
    });

    return (
      <table style={{ borderCollapse: "collapse", margin: "auto" }}>
        <tbody>
          {gridMap.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((color, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: color || "#fff",
                    border: "1px solid #000",
                  }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  useEffect(() => {
    // Calculate responsive tile size based on viewport
    const calculateTileSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const MIN_SIDE_PADDING = 16; // Minimum 16px on each side

      // Estimate heights of UI elements more accurately
      // Header: logo + padding (40-50px logo + 8px padding)
      const HEADER_HEIGHT = viewportWidth < 600 ? 48 : 58;

      // Always use the max controls height (when game is running) so grid doesn't resize
      // Smaller screens have larger buttons, so controls take up more space
      // Started: ~260px on desktop, ~320px on mobile (larger buttons + more spacing)
      const CONTROLS_HEIGHT_ESTIMATE = viewportWidth < 480 ? 320 : 260;

      // Spacing: gap between grid and controls + bottom padding
      const VERTICAL_SPACING = 16;

      // Available height for the grid
      const availableHeight =
        viewportHeight -
        HEADER_HEIGHT -
        CONTROLS_HEIGHT_ESTIMATE -
        VERTICAL_SPACING;

      // Available width for the grid (viewport - side padding on both sides)
      const availableWidth = viewportWidth - MIN_SIDE_PADDING * 2;

      // Size based on smallest viewport dimension, capped at 50% of larger dimension
      // This ensures grid is as large as possible while maintaining aspect ratio
      const isLandscape = viewportWidth > viewportHeight;

      let targetGridSize;
      if (isLandscape) {
        // In landscape: size based on height (smaller), cap at 50% of width
        targetGridSize = Math.min(availableHeight, viewportWidth * 0.5);
      } else {
        // In portrait: size based on width (smaller), cap at 50% of height
        targetGridSize = Math.min(availableWidth, viewportHeight * 0.5);
      }

      // Calculate tile size (8 tiles + 2 * padding)
      const calculatedTileSize = (targetGridSize - GRID_PADDING * 2) / 8;

      // Calculate proportional padding
      const scale = calculatedTileSize / TILE_SIZE;
      const finalPadding = GRID_PADDING * scale;

      // Store the actual grid size for controls to match
      const actualGridSize = calculatedTileSize * 8 + finalPadding * 2;

      setDynamicTileSize(calculatedTileSize);
      setDynamicPadding(finalPadding);
      setGridSize(actualGridSize);
      // Only stack buttons vertically in portrait mode with tall enough viewport
      setIsTallPortrait(!isLandscape && viewportHeight >= 800);

      // Set button size and spacing based on viewport WIDTH
      // Smaller screens get LARGER buttons and MORE spacing for better touch targets
      if (viewportWidth < 480) {
        setButtonSize("large");
        setControlSpacing({ inner: 1.5, outer: 4 });
      } else if (viewportWidth < 768) {
        setButtonSize("medium");
        setControlSpacing({ inner: 1, outer: 3 });
      } else {
        setButtonSize("medium");
        setControlSpacing({ inner: 1, outer: 3 });
      }
    };

    calculateTileSize();

    // Add resize listener
    window.addEventListener("resize", calculateTileSize);
    return () => window.removeEventListener("resize", calculateTileSize);
  }, []); // Empty dependency array - only run on mount and resize

  useEffect(() => {
    // Set up canvas for high DPI displays
    const canvas = document.getElementById("canvas-grid") as HTMLCanvasElement;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = dynamicTileSize * 8 + dynamicPadding * 2;
    const displayHeight = dynamicTileSize * 8 + dynamicPadding * 2;

    // Set the actual canvas size in memory (scaled for DPI)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // Set the display size (CSS pixels)
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";

    // Scale all drawing operations by the dpr
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Redraw when size changes
    if (grid.current) {
      redraw(grid);
    }
  }, [dynamicTileSize, dynamicPadding, redraw]);

  useEffect(() => {
    // Initial draw
    redraw(grid);
  }, [redraw]);

  useEffect(() => {
    // Timer effect - increments every second while game is running
    if (!gameStarted || hasWon) return;

    const intervalId = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameStarted, hasWon]);

  useEffect(() => {
    if (!hasWon || !grid.current) return;

    // Need to unset active shape when we win, and redraw again
    const gridInstance = grid.current;
    gridInstance.getActiveShape()?.setIsActive(false);
    redraw(grid);

    // Wait a few seconds before starting the kaleidoscope effect
    const canvas = document.getElementById("canvas-grid") as HTMLCanvasElement;
    if (!canvas) return;

    let intervalId: number | null = null;
    let kaleidoscopeCount = 0;
    const maxKaleidoscopeIterations = 8;

    const timeoutId = setTimeout(() => {
      // Draw initial kaleidoscope
      gridInstance.drawKaleidoscope(canvas, dynamicTileSize, dynamicPadding);
      kaleidoscopeCount++;

      // Set up interval to redraw kaleidoscope every 1 second
      intervalId = window.setInterval(() => {
        if (kaleidoscopeCount < maxKaleidoscopeIterations) {
          gridInstance.drawKaleidoscope(
            canvas,
            dynamicTileSize,
            dynamicPadding
          );
          kaleidoscopeCount++;
        } else {
          // Stop the kaleidoscope and redraw the original grid
          if (intervalId !== null) clearInterval(intervalId);
          gridInstance.draw(canvas, dynamicTileSize, dynamicPadding);
          // Show the win modal after kaleidoscope completes
          setTimeout(() => setShowWinModal(true), 300);
        }
      }, 500);
    }, 500);

    // Cleanup timeout and interval when component unmounts or hasWon changes
    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [hasWon, dynamicTileSize, dynamicPadding, redraw]);

  // useEffect(() => {
  //   if (!grid.current) return;

  //   const canvas = document.getElementById("canvas-grid") as HTMLCanvasElement;

  //   // Mouse event listeners (on canvas)

  //   const mouseDownHandler = (event: MouseEvent) => {
  //     const tile = getTileFromMousePosition(canvas, event);
  //     if (!grid.current.getActiveShapeAt(tile.x, tile.y)) return;
  //     setDragging({ x: tile.x, y: tile.y });
  //     // Set cursor to "grabbing"
  //     canvas.style.cursor = "grabbing";
  //   };

  //   const mouseUpHandler = (event: MouseEvent) => {
  //     setDragging(false);

  //     const tile = getTileFromMousePosition(canvas, event);
  //     handleCursorChange(grid, canvas, tile);
  //   };

  //   const mouseMoveHandler = (event: MouseEvent) => {
  //     const tile = getTileFromMousePosition(canvas, event);
  //     if (!dragging) {
  //       handleCursorChange(grid, canvas, tile);
  //     }

  //     if (
  //       typeof dragging !== "boolean" &&
  //       tileInBounds(tile.x, tile.y) &&
  //       (tile.x !== dragging.x || tile.y !== dragging.y)
  //     ) {
  //       // We've dragged somewhere new
  //       // Interpolate the shape's tiles by the difference
  //       // Get the x & y difference between the "dragging" tile nad our current tile
  //       const deltaX = tile.x - dragging.x;
  //       const deltaY = tile.y - dragging.y;
  //       console.log("kcollins interpolate", deltaX, deltaY, tile, dragging);
  //       // Update the dragging position
  //       setDragging({ x: tile.x, y: tile.y });
  //       grid.current.interpolateActiveShape(deltaX, deltaY);
  //       // Redraw the grid
  //       redraw(grid);
  //     }
  //   };

  //   canvas.addEventListener("mousedown", mouseDownHandler);
  //   canvas.addEventListener("mouseup", mouseUpHandler);
  //   canvas.addEventListener("mousemove", mouseMoveHandler);

  //   return () => {
  //     canvas.removeEventListener("mousedown", mouseDownHandler);
  //     canvas.removeEventListener("mouseup", mouseUpHandler);
  //     canvas.removeEventListener("mousemove", mouseMoveHandler);
  //   };
  // }, [dragging, setDragging]);

  useEffect(() => {
    if (!grid.current) return;

    // Key event listeners (on document)

    const keyDownHandler = (event: KeyboardEvent) => {
      if (!gameStarted || hasWon) return;

      // Only handle game control keys
      const gameKeys = [
        "r",
        "e",
        "f",
        "v",
        "n",
        "w",
        "s",
        "a",
        "d",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ];
      if (!gameKeys.includes(event.key)) return;

      event.preventDefault();

      switch (event.key) {
        case "r":
          rotateActiveShape(true);
          break;
        case "e":
          rotateActiveShape(false);
          break;
        case "f":
          flipActiveShape(true);
          break;
        case "v":
          flipActiveShape(false);
          break;
        case "n":
          nextShape();
          break;
        case "w":
        case "ArrowUp":
          moveActiveShape("up");
          break;
        case "s":
        case "ArrowDown":
          moveActiveShape("down");
          break;
        case "a":
        case "ArrowLeft":
          moveActiveShape("left");
          break;
        case "d":
        case "ArrowRight":
          moveActiveShape("right");
          break;
      }
    };

    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [
    gameStarted,
    hasWon,
    rotateActiveShape,
    flipActiveShape,
    nextShape,
    moveActiveShape,
  ]);

  return (
    <>
      <Header onAutoComplete={autoComplete} gameStarted={gameStarted} />
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <canvas id="canvas-grid"></canvas>
      </Box>
      <div
        className="controls-container"
        style={{
          maxWidth: gridSize > 0 ? `${gridSize}px` : "420px",
          minWidth: "320px",
        }}
      >
        {!gameStarted && !hasWon && (
          <CenteredColumnStack spacing={2} width="100%">
            {/* Row with input box and difficulty dropdown */}
            <CenteredRowStack spacing={1} width="100%" alignItems="flex-start">
              <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 500, color: "text.primary" }}
                >
                  Puzzle #
                </Typography>
                <TextField
                  value={puzzleNumber}
                  onChange={(e) => setPuzzleNumber(e.target.value)}
                  placeholder="1 - 62642"
                  size="small"
                  fullWidth
                  disabled={isLoading}
                  error={
                    puzzleNumber !== "" &&
                    (isNaN(Number(puzzleNumber)) ||
                      Number(puzzleNumber) < 1 ||
                      Number(puzzleNumber) > 62462)
                  }
                  sx={{
                    "& .MuiInputBase-input::placeholder": {
                      opacity: 0.6,
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">#</InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
              <Typography
                sx={{
                  px: 1,
                  fontFamily: '"American Typewriter", "Courier New", monospace',
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  fontWeight: 500,
                  color: "text.primary",
                  flexShrink: 0,
                  mt: 3,
                }}
              >
                or
              </Typography>
              <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 500, color: "text.primary" }}
                >
                  Difficulty
                </Typography>
                <Select
                  value={difficulty}
                  onChange={handleDifficultyChange}
                  size="small"
                  fullWidth
                  disabled={isLoading || !!puzzleNumber}
                >
                  <MenuItem value={"easy"}>Easy</MenuItem>
                  <MenuItem value={"medium"}>Medium</MenuItem>
                  <MenuItem value={"hard"}>Hard</MenuItem>
                </Select>
              </Box>
            </CenteredRowStack>
            {/* Start button below */}
            <Box sx={{ width: "100%" }}>
              <Button
                onClick={() => {
                  void startGame();
                }}
                color="primary"
                variant="contained"
                size={buttonSize}
                fullWidth
                disabled={
                  isLoading ||
                  (puzzleNumber !== "" &&
                    (isNaN(Number(puzzleNumber)) ||
                      Number(puzzleNumber) < 1 ||
                      Number(puzzleNumber) > 62462))
                }
                sx={{
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Start"
                )}
              </Button>
            </Box>
          </CenteredColumnStack>
        )}
        {gameStarted && !hasWon && (
          <CenteredColumnStack>
            {/* Puzzle number and timer row */}
            <CenteredRowStack spacing={2} width="100%" sx={{ mb: 0.5 }}>
              <Box
                sx={{
                  flex: 1,
                  textAlign: "left",
                  fontFamily: '"American Typewriter", "Courier New", monospace',
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  fontWeight: 600,
                }}
              >
                Puzzle #{grid.current.getPuzzleIndex()}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  textAlign: "right",
                  fontFamily: '"American Typewriter", "Courier New", monospace',
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  fontWeight: 600,
                }}
              >
                {formatTime(elapsedTime)}
              </Box>
            </CenteredRowStack>
            <CenteredRowStack>
              <Button
                color="primary"
                variant="contained"
                onClick={nextShape}
                disabled={!canGoToNextShape}
                size={buttonSize}
                sx={{
                  flexGrow: 3,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                {isLastShape ? "Finish" : "Next shape"}
              </Button>
              <Button
                onClick={undo}
                variant="outlined"
                disabled={!canUndo}
                size={buttonSize}
                sx={{
                  flexGrow: 1,
                }}
              >
                Undo
              </Button>
            </CenteredRowStack>
            {/* Directional and transform controls - stack vertically in portrait, horizontally in landscape */}
            {isTallPortrait ? (
              // Portrait mode: Stack vertically (arrow buttons on top, rotate/flip below)
              <CenteredColumnStack width="100%" spacing={controlSpacing.outer}>
                {/* Arrow buttons */}
                <CenteredColumnStack spacing={controlSpacing.inner}>
                  {/* Up */}
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    <Box>
                      <ArrowButton
                        direction="up"
                        onClick={() => moveActiveShape("up")}
                        size={buttonSize}
                      />
                    </Box>
                  </CenteredRowStack>
                  {/* Left/Right */}
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    <Box>
                      <ArrowButton
                        direction="left"
                        onClick={() => moveActiveShape("left")}
                        size={buttonSize}
                      />
                    </Box>
                    <Box>
                      <ArrowButton
                        direction="right"
                        onClick={() => moveActiveShape("right")}
                        size={buttonSize}
                      />
                    </Box>
                  </CenteredRowStack>
                  {/* Down */}
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    <Box>
                      <ArrowButton
                        direction="down"
                        onClick={() => moveActiveShape("down")}
                        size={buttonSize}
                      />
                    </Box>
                  </CenteredRowStack>
                </CenteredColumnStack>
                {/* Rotate and Flip buttons */}
                <CenteredColumnStack spacing={controlSpacing.inner}>
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    {/* Rotate controls */}
                    <Tooltip
                      title="Rotate left"
                      placement="top"
                      slotProps={tooltipOffset}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => rotateActiveShape(false)}
                        size={buttonSize}
                        sx={{ minWidth: "80px" }}
                      >
                        <Rotate90DegreesCwIcon className={"rotate-left"} />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title="Rotate right"
                      placement="top"
                      slotProps={tooltipOffset}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => rotateActiveShape(true)}
                        size={buttonSize}
                        sx={{ minWidth: "80px" }}
                      >
                        <Rotate90DegreesCwIcon />
                      </Button>
                    </Tooltip>
                  </CenteredRowStack>
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    {/* Flip controls */}
                    <Tooltip
                      title="Flip horizontal"
                      placement="bottom"
                      slotProps={tooltipOffset}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => flipActiveShape(true)}
                        size={buttonSize}
                        sx={{ minWidth: "80px" }}
                      >
                        <SwapHorizIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title="Flip vertical"
                      placement="bottom"
                      slotProps={tooltipOffset}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => flipActiveShape(false)}
                        size={buttonSize}
                        sx={{ minWidth: "80px" }}
                      >
                        <SwapVertIcon />
                      </Button>
                    </Tooltip>
                  </CenteredRowStack>
                </CenteredColumnStack>
              </CenteredColumnStack>
            ) : (
              // Landscape mode: Side-by-side (original layout)
              <CenteredRowStack width="70%" spacing={controlSpacing.outer}>
                {/* Left directional controls */}
                <CenteredColumnStack
                  spacing={controlSpacing.inner}
                  sx={{ flexGrow: 1 }}
                >
                  {/* Up */}
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    <ArrowButton
                      direction="up"
                      onClick={() => moveActiveShape("up")}
                      size={buttonSize}
                    />
                  </CenteredRowStack>
                  {/* Left/Right */}
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    <ArrowButton
                      direction="left"
                      onClick={() => moveActiveShape("left")}
                      size={buttonSize}
                    />
                    <ArrowButton
                      direction="right"
                      onClick={() => moveActiveShape("right")}
                      size={buttonSize}
                    />
                  </CenteredRowStack>
                  {/* Down */}
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    <ArrowButton
                      direction="down"
                      onClick={() => moveActiveShape("down")}
                      size={buttonSize}
                    />
                  </CenteredRowStack>
                </CenteredColumnStack>
                {/* Right directional controls */}
                <CenteredColumnStack
                  spacing={controlSpacing.inner}
                  sx={{ flexGrow: 1 }}
                >
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    {/* Rotate controls */}
                    <Tooltip
                      title="Rotate left"
                      placement="top"
                      slotProps={tooltipOffset}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => rotateActiveShape(false)}
                        size={buttonSize}
                      >
                        <Rotate90DegreesCwIcon className={"rotate-left"} />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title="Rotate right"
                      placement="top"
                      slotProps={tooltipOffset}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => rotateActiveShape(true)}
                        size={buttonSize}
                      >
                        <Rotate90DegreesCwIcon />
                      </Button>
                    </Tooltip>
                  </CenteredRowStack>
                  <CenteredRowStack spacing={controlSpacing.inner}>
                    {/* Flip controls */}
                    <Tooltip
                      title="Flip horizontal"
                      placement="bottom"
                      slotProps={tooltipOffset}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => flipActiveShape(true)}
                        size={buttonSize}
                      >
                        <SwapHorizIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title="Flip vertical"
                      placement="bottom"
                      slotProps={tooltipOffset}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => flipActiveShape(false)}
                        size={buttonSize}
                      >
                        <SwapVertIcon />
                      </Button>
                    </Tooltip>
                  </CenteredRowStack>
                </CenteredColumnStack>
              </CenteredRowStack>
            )}
          </CenteredColumnStack>
        )}
        {showSolutionModal && (
          <Box
            sx={{
              position: "relative",
              bgcolor: "background.paper",
              boxShadow: 3,
              p: 2,
              borderRadius: 2,
              mt: 3,
              maxWidth: "400px",
              mx: "auto",
            }}
          >
            <IconButton
              onClick={closeSolutionModal}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
              }}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h5" sx={{ textAlign: "center", marginTop: 0 }}>
              Solution
            </Typography>
            {renderSolutionTable()}
          </Box>
        )}
        {showWinModal && (
          <Slide direction="up" in={showWinModal} timeout={500}>
            <Box
              sx={{
                bgcolor: "background.paper",
                boxShadow: 3,
                p: 4,
                borderRadius: 2,
                maxWidth: "600px",
                mx: "auto",
                textAlign: "center",
                mb: 2,
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom>
                Octamino!
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                You solved the puzzle in {formatTime(elapsedTime)}
              </Typography>
              <Button
                color="primary"
                variant="contained"
                onClick={restartGame}
                size={buttonSize}
                sx={{
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Play again
              </Button>
            </Box>
          </Slide>
        )}
      </div>
    </>
  );
}

export default App;
