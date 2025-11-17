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
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
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
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [canGoToNextShape, setCanGoToNextShape] = useState<boolean>(true);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [isLastShape, setIsLastShape] = useState<boolean>(false);
  const [numMoves, setNumMoves] = useState<number>(0);

  const redraw = (grid: React.RefObject<Grid>) => {
    const canvas = document.getElementById("canvas-grid") as HTMLCanvasElement;
    grid.current.draw(canvas);
    setCanGoToNextShape(!grid.current.hasOverlappingShapes());
    setCanUndo(grid.current.getShapes().length > 1);
    setIsLastShape(grid.current.getShapes().length === 8);
  };

  const startGame = async () => {
    setGameStarted(true);
    await grid.current.startGame(difficulty);
    redraw(grid);
  };

  const rotateActiveShape = useCallback((clockwise: boolean) => {
    grid.current.rotateActiveShape(clockwise);
    redraw(grid);
  }, []);

  const flipActiveShape = useCallback((horizontal: boolean) => {
    grid.current.flipActiveShape(horizontal);
    redraw(grid);
  }, []);

  const nextShape = useCallback(() => {
    setNumMoves(numMoves + 1);
    if (grid.current.hasWon()) {
      setHasWon(true);
      redraw(grid);
      return;
    }
    if (!grid.current.hasOverlappingShapes()) {
      grid.current.addShape();
      redraw(grid);
    }
  }, [numMoves]);

  const moveActiveShape = useCallback((direction: MoveShapeDirection) => {
    grid.current.moveActiveShape(direction);
    redraw(grid);
  }, []);

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

  // const autoComplete = () => {
  //   grid.current.autoComplete();
  //   setHasWon(true);
  //   redraw(grid);
  // };

  const restartGame = () => {
    setGameStarted(false);
    setHasWon(false);
    setNumMoves(0);
    setCanGoToNextShape(true);
    setCanUndo(false);
    setIsLastShape(false);
    setShowSolutionModal(false);
    grid.current = new Grid();
    redraw(grid);
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
    // Initial draw
    redraw(grid);
  }, []);

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
      gridInstance.drawKaleidoscope(canvas);
      kaleidoscopeCount++;

      // Set up interval to redraw kaleidoscope every 1 second
      intervalId = window.setInterval(() => {
        if (kaleidoscopeCount < maxKaleidoscopeIterations) {
          gridInstance.drawKaleidoscope(canvas);
          kaleidoscopeCount++;
        } else {
          // Stop the kaleidoscope and redraw the original grid
          if (intervalId !== null) clearInterval(intervalId);
          gridInstance.draw(canvas);
        }
      }, 500);
    }, 500);

    // Cleanup timeout and interval when component unmounts or hasWon changes
    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [hasWon]);

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
      <Header />
      <canvas
        id="canvas-grid"
        // +1 for the lines
        width={TILE_SIZE * 8 + GRID_PADDING * 2}
        height={TILE_SIZE * 8 + GRID_PADDING * 2}
      ></canvas>
      <div className="controls-container">
        {!gameStarted && !hasWon && (
          <CenteredRowStack spacing={2} width="100%">
            <Box sx={{ flex: 3 }}>
              <Button
                onClick={() => {
                  void startGame();
                }}
                color="primary"
                variant="contained"
                size="large"
                fullWidth
              >
                Play
              </Button>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Select
                value={difficulty}
                onChange={handleDifficultyChange}
                size="small"
                fullWidth
              >
                <MenuItem value={"easy"}>Easy</MenuItem>
                <MenuItem value={"medium"}>Medium</MenuItem>
                <MenuItem value={"hard"}>Hard</MenuItem>
              </Select>
            </Box>
          </CenteredRowStack>
        )}
        {gameStarted && !hasWon && (
          <CenteredColumnStack>
            <CenteredRowStack>
              <Button
                color="primary"
                variant="contained"
                onClick={nextShape}
                disabled={!canGoToNextShape}
                sx={{ flexGrow: 3 }}
              >
                {isLastShape ? "Finish" : "Next Shape"}
              </Button>
              <Button
                onClick={undo}
                variant="outlined"
                disabled={!canUndo}
                sx={{ flexGrow: 1 }}
                // startIcon={
                //   <UndoIcon color={canUndo ? "primary" : "disabled"} />
                // }
              >
                Undo
              </Button>
            </CenteredRowStack>
            <CenteredRowStack width="70%">
              {/* Left directional controls */}
              <CenteredColumnStack spacing={0.5} sx={{ flexGrow: 1 }}>
                {/* Up */}
                <CenteredRowStack spacing={0.5}>
                  <ArrowButton
                    direction="up"
                    onClick={() => moveActiveShape("up")}
                  />
                </CenteredRowStack>
                {/* Left/Right */}
                <CenteredRowStack spacing={0.5}>
                  <ArrowButton
                    direction="left"
                    onClick={() => moveActiveShape("left")}
                  />
                  <ArrowButton
                    direction="right"
                    onClick={() => moveActiveShape("right")}
                  />
                </CenteredRowStack>
                {/* Down */}
                <CenteredRowStack spacing={0.5}>
                  <ArrowButton
                    direction="down"
                    onClick={() => moveActiveShape("down")}
                  />
                </CenteredRowStack>
              </CenteredColumnStack>
              {/* Right directional controls */}
              <CenteredColumnStack spacing={1} sx={{ flexGrow: 1 }}>
                <CenteredRowStack spacing={1}>
                  {/* Rotate controls */}
                  <Tooltip
                    title="Rotate left"
                    placement="top"
                    slotProps={tooltipOffset}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => rotateActiveShape(false)}
                    >
                      <Rotate90DegreesCwIcon
                        color="primary"
                        className={"rotate-left"}
                      />
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
                    >
                      <Rotate90DegreesCwIcon color="primary" />
                    </Button>
                  </Tooltip>
                </CenteredRowStack>
                <CenteredRowStack spacing={1}>
                  {/* Flip controls */}
                  <Tooltip
                    title="Flip horizontal"
                    placement="bottom"
                    slotProps={tooltipOffset}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => flipActiveShape(true)}
                    >
                      <SwapHorizIcon color="primary" />
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
                    >
                      <SwapVertIcon color="primary" />
                    </Button>
                  </Tooltip>
                </CenteredRowStack>
              </CenteredColumnStack>
            </CenteredRowStack>
            {/* <Button onClick={showSolution}>Show Solution</Button>
            <Button onClick={autoComplete}>Auto complete</Button> */}
          </CenteredColumnStack>
        )}
        {hasWon && (
          <CenteredColumnStack spacing={2}>
            <Alert severity="success">
              Congratulations, you won in {numMoves} moves!
            </Alert>
            <Button color="primary" variant="contained" onClick={restartGame}>
              Play again
            </Button>
            {/* <Box sx={{ mt: 2, textAlign: "center" }}>
              <h2>Solution</h2>
              {renderSolutionTable(true)}
            </Box> */}
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
      </div>
    </>
  );
}

export default App;
