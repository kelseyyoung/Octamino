import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Grid, GRID_PADDING, TILE_SIZE } from "./objects/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import UndoIcon from "@mui/icons-material/Undo";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";

function getTileFromMousePosition(
  canvas: HTMLCanvasElement,
  event: MouseEvent
) {
  // Get the mouse position relative to the canvas
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left - GRID_PADDING;
  const mouseY = event.clientY - rect.top - GRID_PADDING;

  // Determine the tile coordinates
  const tileX = Math.floor(mouseX / TILE_SIZE);
  const tileY = Math.floor(mouseY / TILE_SIZE);
  return { x: tileX, y: tileY };
}

function handleCursorChange(
  grid: React.RefObject<Grid>,
  canvas: HTMLCanvasElement,
  tile: { x: number; y: number }
) {
  if (grid.current.getActiveShapeAt(tile.x, tile.y) !== null) {
    // We did a mouse up over the active shape
    // Set cursor to "grab"
    canvas.style.cursor = "grab";
  } else {
    // Not over the active shape, set cursor to "default"
    canvas.style.cursor = "default";
  }
}

function tileInBounds(x: number, y: number) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function App() {
  const grid = useRef<Grid>(new Grid());
  const [dragging, setDragging] = useState<boolean | { x: number; y: number }>(
    false
  );
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [canGoToNextShape, setCanGoToNextShape] = useState<boolean>(true);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);

  function redraw(grid: React.RefObject<Grid>) {
    const canvas = document.getElementById("canvas-grid") as HTMLCanvasElement;
    grid.current.draw(canvas);
    setCanGoToNextShape(!grid.current.hasOverlappingShapes());
    setCanUndo(grid.current.getShapes().length > 1);
    setHasWon(grid.current.hasWon());
  }

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

  useEffect(() => {
    if (!grid.current) return;

    const canvas = document.getElementById("canvas-grid") as HTMLCanvasElement;

    // Event listeners

    const mouseDownHandler = (event: MouseEvent) => {
      const tile = getTileFromMousePosition(canvas, event);
      if (!grid.current.getActiveShapeAt(tile.x, tile.y)) return;
      setDragging({ x: tile.x, y: tile.y });
      // Set cursor to "grabbing"
      canvas.style.cursor = "grabbing";
    };

    const mouseUpHandler = (event: MouseEvent) => {
      setDragging(false);

      const tile = getTileFromMousePosition(canvas, event);
      handleCursorChange(grid, canvas, tile);
    };

    const mouseMoveHandler = (event: MouseEvent) => {
      const tile = getTileFromMousePosition(canvas, event);
      if (!dragging) {
        handleCursorChange(grid, canvas, tile);
      }

      if (
        typeof dragging !== "boolean" &&
        tileInBounds(tile.x, tile.y) &&
        (tile.x !== dragging.x || tile.y !== dragging.y)
      ) {
        // We've dragged somewhere new
        // Interpolate the shape's tiles by the difference
        // Get the x & y difference between the "dragging" tile nad our current tile
        const deltaX = tile.x - dragging.x;
        const deltaY = tile.y - dragging.y;
        grid.current.interpolateActiveShape(deltaX, deltaY);
        // Redraw the grid
        redraw(grid);
        // Update the dragging position
        setDragging({ x: tile.x, y: tile.y });
      }
    };

    canvas.addEventListener("mousedown", mouseDownHandler);
    canvas.addEventListener("mouseup", mouseUpHandler);
    canvas.addEventListener("mousemove", mouseMoveHandler);

    return () => {
      canvas.removeEventListener("mousedown", mouseDownHandler);
      canvas.removeEventListener("mouseup", mouseUpHandler);
      canvas.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, [dragging, setDragging]);

  const startGame = async () => {
    setGameStarted(true);
    await grid.current.startGame(difficulty);
    redraw(grid);
  };

  const rotateActiveShape = (clockwise: boolean) => {
    grid.current.rotateActiveShape(clockwise);
    redraw(grid);
  };

  const flipActiveShape = (horizontal: boolean) => {
    grid.current.flipActiveShape(horizontal);
    redraw(grid);
  };

  const nextShape = () => {
    if (!grid.current.hasOverlappingShapes()) {
      grid.current.addShape();
      redraw(grid);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    setDifficulty(event.target.value as "easy" | "medium" | "hard");
  };

  const undo = () => {
    grid.current.undo();
    redraw(grid);
  };

  return (
    <>
      <canvas
        id="canvas-grid"
        // +1 for the lines
        width={(TILE_SIZE + 1) * 8 + GRID_PADDING * 2}
        height={(TILE_SIZE + 1) * 8 + GRID_PADDING * 2}
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
            <Select value={difficulty} onChange={handleChange} size="small">
              <MenuItem value={"easy"}>Easy</MenuItem>
              <MenuItem value={"medium"}>Medium</MenuItem>
              <MenuItem value={"hard"}>Hard</MenuItem>
            </Select>
          </div>
        )}
        {gameStarted && !hasWon && (
          <>
            <div>
              <Button
                variant="outlined"
                onClick={nextShape}
                disabled={!canGoToNextShape}
              >
                Next Shape
              </Button>
            </div>
            <div>
              <Tooltip title="Undo">
                <IconButton onClick={undo} disabled={!canUndo}>
                  <UndoIcon color={canUndo ? "primary" : "disabled"} />
                </IconButton>
              </Tooltip>
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
            </div>
          </>
        )}
        {hasWon && <Alert severity="success">Congratulations, you win!</Alert>}
      </div>
    </>
  );
}

export default App;
