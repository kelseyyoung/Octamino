import { Shape, COLORS } from "./Shape";

export const TILE_SIZE = 50;
// Padding on left & right of the grid
export const GRID_PADDING = 10;
export const GRID_TILES = 8;

export type MoveShapeDirection = "up" | "down" | "left" | "right";

export class Grid {
  private initialShape: Shape | null;
  private allShapes: Shape[];
  private shapesOnGrid: Shape[];
  private puzzleIndex: number;
  constructor() {
    this.initialShape = null;
    this.allShapes = [];
    this.shapesOnGrid = [];
    this.puzzleIndex = 0;
  }

  private randomizeShape(shape: Shape): void {
    // Random rotation (0-3 times, each rotation is 90 degrees)
    const numRotations = Math.floor(Math.random() * 4);
    for (let i = 0; i < numRotations; i++) {
      shape.rotate(true);
    }

    // Random flips (both horizontal and vertical, independently)
    if (Math.random() < 0.5) {
      shape.flip(true); // horizontal flip
    }
    if (Math.random() < 0.5) {
      shape.flip(false); // vertical flip
    }

    // Get the bounds of the shape after rotation/flipping
    const tiles = shape.getTiles();
    const xs = tiles.map((tile) => tile.getX());
    const ys = tiles.map((tile) => tile.getY());
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Calculate the width and height of the shape
    const shapeWidth = maxX - minX;
    const shapeHeight = maxY - minY;

    // Generate a random position that keeps the shape within bounds
    const maxPossibleX = GRID_TILES - 1 - shapeWidth;
    const maxPossibleY = GRID_TILES - 1 - shapeHeight;
    const randomX = Math.floor(Math.random() * (maxPossibleX + 1));
    const randomY = Math.floor(Math.random() * (maxPossibleY + 1));

    // Calculate the offset needed to move the shape to the random position
    const deltaX = randomX - minX;
    const deltaY = randomY - minY;

    // Move the shape to the random position
    shape.interpolate(deltaX, deltaY);
  }

  async startGame(ranking: "easy" | "medium" | "hard") {
    // this.initialShape = Shape.generateRandomShape();
    const result = await Shape.generateShapesFromRanking(ranking);
    this.allShapes = result.shapes;
    this.puzzleIndex = result.puzzleIndex;
    this.initialShape = this.allShapes[0];
    const nextShape = Shape.duplicate(this.initialShape);
    this.randomizeShape(nextShape);
    nextShape.setIsActive(true);
    this.shapesOnGrid.push(nextShape);
  }

  async startGameWithPuzzleIndex(puzzleIndex: number) {
    const result = await Shape.generateShapesFromPuzzleIndex(puzzleIndex);
    this.allShapes = result.shapes;
    this.puzzleIndex = result.puzzleIndex;
    this.initialShape = this.allShapes[0];
    const nextShape = Shape.duplicate(this.initialShape);
    this.randomizeShape(nextShape);
    nextShape.setIsActive(true);
    this.shapesOnGrid.push(nextShape);
  }

  addShape() {
    if (!this.initialShape) {
      console.error("Tried to add shape before starting the game!");
      return;
    }
    const currActiveShape = this.getActiveShape();
    if (currActiveShape) {
      currActiveShape.setIsActive(false);
    }
    // Only add a next shape if there are less than 8 shapes
    if (this.shapesOnGrid.length < 8) {
      const nextShape = Shape.duplicate(this.initialShape);
      // Set the next correct color
      nextShape.setColor(this.allShapes[this.shapesOnGrid.length].getColor());
      this.randomizeShape(nextShape);
      nextShape.setIsActive(true);
      this.shapesOnGrid.push(nextShape);
    }
  }

  undo() {
    // We can only undo if there is more than 1 shape
    if (this.shapesOnGrid.length <= 1) return;

    // Take the last shape off of the array
    this.shapesOnGrid.pop();

    // Set the new last shape to be active
    const newActiveShape = this.shapesOnGrid[this.shapesOnGrid.length - 1];
    newActiveShape.setIsActive(true);
  }

  getShapes() {
    return this.shapesOnGrid;
  }

  getPuzzleIndex() {
    return this.puzzleIndex;
  }

  moveActiveShape(direction: MoveShapeDirection) {
    const activeShape = this.getActiveShape();
    if (!activeShape) return;
    switch (direction) {
      case "up":
        activeShape.interpolate(0, -1);
        break;
      case "down":
        activeShape.interpolate(0, 1);
        break;
      case "left":
        activeShape.interpolate(-1, 0);
        break;
      case "right":
        activeShape.interpolate(1, 0);
        break;
    }
  }

  hasWon(): boolean {
    // The player has won if 1) there are 8 shapes in the grid and 2) none of those shapes overlap
    return this.shapesOnGrid.length === 8 && !this.hasOverlappingShapes();
  }

  hasOverlappingShapes(): boolean {
    // Iterate over all positions in the grid
    // If multiple shapes occupy that position, return true
    const occupiedPositions: Set<string> = new Set();
    for (const shape of this.shapesOnGrid) {
      for (const tile of shape.getTiles()) {
        const posKey = `${tile.getX()},${tile.getY()}`;
        if (occupiedPositions.has(posKey)) {
          return true;
        }
        occupiedPositions.add(posKey);
      }
    }
    return false;
  }

  getActiveShapeAt(x: number, y: number): Shape | null {
    for (const shape of this.shapesOnGrid) {
      if (shape.getIsActive() && shape.hasTileAt(x, y)) {
        return shape;
      }
    }
    return null;
  }

  getActiveShape(): Shape | null {
    for (const shape of this.shapesOnGrid) {
      if (shape.getIsActive()) {
        return shape;
      }
    }
    return null;
  }

  interpolateActiveShape(deltaX: number, deltaY: number) {
    const activeShape = this.getActiveShape();
    if (!activeShape) return;
    activeShape.interpolate(deltaX, deltaY);
  }

  rotateActiveShape(clockwise: boolean) {
    // Rotate the active shape 90 degrees, either clockwise or counter-clockwise
    // Then potentially interpolate the shape if it's out of bounds of the grid
    const activeShape = this.getActiveShape();
    if (!activeShape) return;

    activeShape.rotate(clockwise);

    // Ensure the shape stays within the grid bounds after rotation
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const tile of activeShape.getTiles()) {
      const x = tile.getX();
      const y = tile.getY();
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    let deltaX = 0;
    let deltaY = 0;

    if (minX < 0) deltaX = -minX;
    if (maxX >= GRID_TILES) deltaX = GRID_TILES - 1 - maxX;
    if (minY < 0) deltaY = -minY;
    if (maxY >= GRID_TILES) deltaY = GRID_TILES - 1 - maxY;

    if (deltaX !== 0 || deltaY !== 0) {
      activeShape.interpolate(deltaX, deltaY);
    }
  }

  flipActiveShape(vertical: boolean) {
    // Flips the active shape either vertically or horizontally
    // Then potentially interpolate the shape if it's out of bounds of the grid
    const activeShape = this.getActiveShape();
    if (!activeShape) return;

    activeShape.flip(vertical);

    // Ensure the shape stays within the grid bounds after flip
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const tile of activeShape.getTiles()) {
      const x = tile.getX();
      const y = tile.getY();
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    let deltaX = 0;
    let deltaY = 0;

    if (minX < 0) deltaX = -minX;
    if (maxX >= GRID_TILES) deltaX = GRID_TILES - 1 - maxX;
    if (minY < 0) deltaY = -minY;
    if (maxY >= GRID_TILES) deltaY = GRID_TILES - 1 - maxY;

    if (deltaX !== 0 || deltaY !== 0) {
      activeShape.interpolate(deltaX, deltaY);
    }
  }

  getSolutionShapes(): Shape[] {
    return this.allShapes;
  }

  autoComplete() {
    // Set the shapes on grid to all the solution shapes
    this.shapesOnGrid = [...this.allShapes];
    // Deactivate all shapes since the puzzle is complete
    this.shapesOnGrid.forEach((shape) => shape.setIsActive(false));
  }

  drawKaleidoscope(
    canvas: HTMLCanvasElement,
    tileSize: number = TILE_SIZE,
    gridPadding: number = GRID_PADDING
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill the grid background with white
    ctx.fillStyle = "white";
    ctx.fillRect(
      gridPadding,
      gridPadding,
      GRID_TILES * tileSize,
      GRID_TILES * tileSize
    );

    // Draw the grid lines (offset by 0.5 for crisp 1px lines)
    // Only draw interior lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_TILES; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(gridPadding + i * tileSize + 0.5, gridPadding);
      ctx.lineTo(
        gridPadding + i * tileSize + 0.5,
        gridPadding + GRID_TILES * tileSize
      );
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(gridPadding, gridPadding + i * tileSize + 0.5);
      ctx.lineTo(
        gridPadding + GRID_TILES * tileSize,
        gridPadding + i * tileSize + 0.5
      );
      ctx.stroke();
    }

    // Create an array with each color appearing 8 times (total 64)
    const colorArray: string[] = [];
    for (const color of COLORS) {
      for (let i = 0; i < 8; i++) {
        colorArray.push(color);
      }
    }

    // Shuffle the color array using Fisher-Yates shuffle
    for (let i = colorArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colorArray[i], colorArray[j]] = [colorArray[j], colorArray[i]];
    }

    // Draw each tile with a random color
    let colorIndex = 0;
    for (let row = 0; row < GRID_TILES; row++) {
      for (let col = 0; col < GRID_TILES; col++) {
        const x = gridPadding + col * tileSize;
        const y = gridPadding + row * tileSize;
        ctx.fillStyle = colorArray[colorIndex];
        ctx.fillRect(x, y, tileSize, tileSize);
        colorIndex++;
      }
    }

    // Draw outer border around the entire grid (on top of everything)
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      gridPadding + 0.5,
      gridPadding + 0.5,
      GRID_TILES * tileSize - 1,
      GRID_TILES * tileSize - 1
    );
  }

  draw(
    canvas: HTMLCanvasElement,
    tileSize: number = TILE_SIZE,
    gridPadding: number = GRID_PADDING
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill the grid background with white
    ctx.fillStyle = "white";
    ctx.fillRect(
      gridPadding,
      gridPadding,
      GRID_TILES * tileSize,
      GRID_TILES * tileSize
    );

    // Draw the grid lines (offset by 0.5 for crisp 1px lines)
    // Only draw interior lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_TILES; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(gridPadding + i * tileSize + 0.5, gridPadding);
      ctx.lineTo(
        gridPadding + i * tileSize + 0.5,
        gridPadding + GRID_TILES * tileSize
      );
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(gridPadding, gridPadding + i * tileSize + 0.5);
      ctx.lineTo(
        gridPadding + GRID_TILES * tileSize,
        gridPadding + i * tileSize + 0.5
      );
      ctx.stroke();
    }

    for (const shape of this.shapesOnGrid) {
      for (const tile of shape.getTiles()) {
        const x = gridPadding + tile.getX() * tileSize;
        const y = gridPadding + tile.getY() * tileSize;
        if (shape.getIsActive()) {
          ctx.globalAlpha = 0.7;
        } else {
          ctx.globalAlpha = 1.0;
        }
        ctx.fillStyle = shape.getColor();
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.globalAlpha = 1.0;
        if (shape.getIsActive()) {
          // Draw borders for active Shapes
          // However don't draw lines on adjacent Tiles
          // Only draw borders on sides not adjacent to another tile of the same shape
          const tileX = tile.getX();
          const tileY = tile.getY();
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 3;
          // Left border
          if (!shape.hasTileAt(tileX - 1, tileY)) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + tileSize);
            ctx.stroke();
          }
          // Right border
          if (!shape.hasTileAt(tileX + 1, tileY)) {
            ctx.beginPath();
            ctx.moveTo(x + tileSize, y);
            ctx.lineTo(x + tileSize, y + tileSize);
            ctx.stroke();
          }
          // Top border
          if (!shape.hasTileAt(tileX, tileY - 1)) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + tileSize, y);
            ctx.stroke();
          }
          // Bottom border
          if (!shape.hasTileAt(tileX, tileY + 1)) {
            ctx.beginPath();
            ctx.moveTo(x, y + tileSize);
            ctx.lineTo(x + tileSize, y + tileSize);
            ctx.stroke();
          }
        }
      }
    }

    // Draw outer border around the entire grid (on top of everything)
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      gridPadding + 0.5,
      gridPadding + 0.5,
      GRID_TILES * tileSize - 1,
      GRID_TILES * tileSize - 1
    );
  }
}
