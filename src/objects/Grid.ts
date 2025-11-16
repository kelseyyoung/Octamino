import { Shape } from "./Shape";

export const TILE_SIZE = 50;
// Padding on left & right of the grid
export const GRID_PADDING = 10;
export const GRID_TILES = 8;

export class Grid {
  private initialShape: Shape | null = null;
  private shapes: Shape[];
  constructor(shapes?: Shape[]) {
    this.shapes = shapes ?? [];
  }

  async startGame(ranking: "easy" | "medium" | "hard") {
    // this.initialShape = Shape.generateRandomShape();
    this.initialShape = await Shape.generateShapeFromRanking(ranking);
    const nextShape = Shape.duplicate(this.initialShape);
    nextShape.setIsActive(true);
    this.shapes.push(nextShape);
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
    if (this.shapes.length < 8) {
      const nextShape = Shape.duplicate(this.initialShape);
      nextShape.setIsActive(true);
      this.shapes.push(nextShape);
    }
  }

  undo() {
    // We can only undo if there is more than 1 shape
    if (this.shapes.length <= 1) return;

    // Take the last shape off of the array
    this.shapes.pop();

    // Set the new last shape to be active
    const newActiveShape = this.shapes[this.shapes.length - 1];
    newActiveShape.setIsActive(true);
  }

  getShapes() {
    return this.shapes;
  }

  hasWon(): boolean {
    // The player has won if 1) there are 8 shapes in the grid and 2) none of those shapes overlap
    return this.shapes.length === 8 && !this.hasOverlappingShapes();
  }

  hasOverlappingShapes(): boolean {
    // Iterate over all positions in the grid
    // If multiple shapes occupy that position, return true
    const occupiedPositions: Set<string> = new Set();
    for (const shape of this.shapes) {
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
    for (const shape of this.shapes) {
      if (shape.getIsActive() && shape.hasTileAt(x, y)) {
        return shape;
      }
    }
    return null;
  }

  getActiveShape(): Shape | null {
    for (const shape of this.shapes) {
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

  draw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the grid lines
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_TILES; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(GRID_PADDING + i * TILE_SIZE, GRID_PADDING);
      ctx.lineTo(
        GRID_PADDING + i * TILE_SIZE,
        GRID_PADDING + GRID_TILES * TILE_SIZE
      );
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(GRID_PADDING, GRID_PADDING + i * TILE_SIZE);
      ctx.lineTo(
        GRID_PADDING + GRID_TILES * TILE_SIZE,
        GRID_PADDING + i * TILE_SIZE
      );
      ctx.stroke();
    }

    for (const shape of this.shapes) {
      for (const tile of shape.getTiles()) {
        const x = GRID_PADDING + tile.getX() * TILE_SIZE;
        const y = GRID_PADDING + tile.getY() * TILE_SIZE;
        if (shape.getIsActive()) {
          ctx.globalAlpha = 0.7;
        } else {
          ctx.globalAlpha = 1.0;
        }
        ctx.fillStyle = tile.getColor();
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.globalAlpha = 1.0;
        if (shape.getIsActive()) {
          // Draw borders for active Shapes
          // However don't draw lines on adjacent Tiles
          // Only draw borders on sides not adjacent to another tile of the same shape
          const tileX = tile.getX();
          const tileY = tile.getY();
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2;
          // Left border
          if (!shape.hasTileAt(tileX - 1, tileY)) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + TILE_SIZE);
            ctx.stroke();
          }
          // Right border
          if (!shape.hasTileAt(tileX + 1, tileY)) {
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE, y);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
            ctx.stroke();
          }
          // Top border
          if (!shape.hasTileAt(tileX, tileY - 1)) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + TILE_SIZE, y);
            ctx.stroke();
          }
          // Bottom border
          if (!shape.hasTileAt(tileX, tileY + 1)) {
            ctx.beginPath();
            ctx.moveTo(x, y + TILE_SIZE);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
            ctx.stroke();
          }
        }
      }
    }
  }
}
