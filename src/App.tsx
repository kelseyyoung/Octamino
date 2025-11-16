import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import {
  Grid,
  GRID_PADDING,
  TILE_SIZE,
  type MoveShapeDirection,
} from "./objects/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

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

  const redraw = (grid: React.RefObject<Grid>) => {
    const canvas = document.getElementById("canvas-grid") as HTMLCanvasElement;
    grid.current.draw(canvas);
    setCanGoToNextShape(!grid.current.hasOverlappingShapes());
    setCanUndo(grid.current.getShapes().length > 1);
    setHasWon(grid.current.hasWon());
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
    if (!grid.current.hasOverlappingShapes()) {
      grid.current.addShape();
      redraw(grid);
    }
  }, []);

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

  const showSolution = () => {
    setShowSolutionModal(true);
  };

  const closeSolutionModal = () => {
    setShowSolutionModal(false);
  };

  const renderSolutionTable = () => {
    const solutionShapes = grid.current?.getSolutionShapes() || [];
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
    if (hasWon) {
      // Need to unset active shape when we win, and redraw again
      grid.current.getActiveShape()?.setIsActive(false);
      redraw(grid);
    }
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
      <canvas
        id="canvas-grid"
        // +1 for the lines
        width={TILE_SIZE * 8 + GRID_PADDING * 2}
        height={TILE_SIZE * 8 + GRID_PADDING * 2}
      ></canvas>
      <div className="controls-container">
        {!gameStarted && !hasWon && (
          <div>
            <Button
              onClick={() => {
                void startGame();
              }}
              variant="outlined"
              size="large"
            >
              Start
            </Button>
            <Select
              value={difficulty}
              onChange={handleDifficultyChange}
              size="small"
            >
              <MenuItem value={"easy"}>Easy</MenuItem>
              <MenuItem value={"medium"}>Medium</MenuItem>
              <MenuItem value={"hard"}>Hard</MenuItem>
            </Select>
          </div>
        )}
        {gameStarted && !hasWon && (
          <Stack
            direction="column"
            useFlexGap
            width={"100%"}
            sx={{ alignItems: "center" }}
            spacing={2}
          >
            <Stack
              direction="row"
              useFlexGap
              width={"100%"}
              sx={{ alignItems: "center" }}
              spacing={2}
            >
              <Button
                color="primary"
                variant="contained"
                onClick={nextShape}
                disabled={!canGoToNextShape}
                sx={{ flexGrow: 3 }}
              >
                Next Shape
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
            </Stack>
            <Stack
              direction="row"
              useFlexGap
              width={"70%"}
              sx={{ alignItems: "center" }}
              spacing={2}
            >
              {/* Left directional controls */}
              <Stack
                direction="column"
                useFlexGap
                sx={{ alignItems: "center", flexGrow: 1 }}
                spacing={0}
              >
                <div>
                  {/* Up */}
                  <Tooltip title="Move up">
                    <IconButton onClick={() => moveActiveShape("up")}>
                      <ArrowUpwardIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </div>
                <div>
                  {/* Left/Right */}
                  <Tooltip title="Move left">
                    <IconButton onClick={() => moveActiveShape("left")}>
                      <ArrowBackIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Move right">
                    <IconButton onClick={() => moveActiveShape("right")}>
                      <ArrowForwardIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </div>
                <div>
                  {/* Down */}
                  <Tooltip title="Move down">
                    <IconButton onClick={() => moveActiveShape("down")}>
                      <ArrowDownwardIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </div>
              </Stack>
              {/* Right directional controls */}
              <Stack
                direction="column"
                useFlexGap
                sx={{ alignItems: "center", flexGrow: 1 }}
                spacing={1}
              >
                <Stack
                  direction="row"
                  useFlexGap
                  sx={{ alignItems: "center" }}
                  spacing={1}
                >
                  {/* Rotate controls */}
                  <Tooltip title="Rotate right">
                    <IconButton onClick={() => rotateActiveShape(true)}>
                      <Rotate90DegreesCwIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Rotate left">
                    <IconButton onClick={() => rotateActiveShape(false)}>
                      <Rotate90DegreesCwIcon
                        color="primary"
                        className={"rotate-left"}
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Stack
                  direction="row"
                  useFlexGap
                  sx={{ alignItems: "center" }}
                  spacing={1}
                >
                  {/* Flip controls */}
                  <Tooltip title="Flip horizontal">
                    <IconButton onClick={() => flipActiveShape(true)}>
                      <SwapHorizIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Flip vertical">
                    <IconButton onClick={() => flipActiveShape(false)}>
                      <SwapVertIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Stack>
            <Button onClick={showSolution}>Show Solution</Button>
          </Stack>
        )}
        {hasWon && <Alert severity="success">Congratulations, you win!</Alert>}
      </div>
      <Modal
        open={showSolutionModal}
        onClose={closeSolutionModal}
        aria-labelledby="solution-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: "none",
          }}
        >
          <h2 id="solution-modal-title" style={{ textAlign: "center" }}>
            Solution
          </h2>
          {renderSolutionTable()}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button onClick={closeSolutionModal} variant="contained">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default App;
