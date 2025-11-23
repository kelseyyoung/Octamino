import { GRID_TILES } from "./Grid";
import { Tile } from "./Tile";

let rankings: string = "";
async function loadRankings(): Promise<void> {
  if (!rankings) {
    const response = await fetch(
      `${import.meta.env.BASE_URL}RankingWithEntireSquare.txt`
    );
    rankings = await response.text();
  }
}

function generateRandomColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;
}

export const COLORS = [
  "#FD9301",
  "#FFFF00",
  "#23FA00",
  "#FD40FF",
  "#27FDFF",
  "#0A32FF",
  "#FD2600",
  "#7030A0",
];

export class Shape {
  private tiles: Tile[];
  private color: string;
  private isActive: boolean = false;

  constructor(
    tilePositions: { x: number; y: number }[],
    color?: string,
    isActive?: boolean
  ) {
    if (isActive !== undefined) {
      this.isActive = isActive;
    }
    // Generate a random color
    this.color = color ?? generateRandomColor();
    // Create tiles at each tile position
    this.tiles = tilePositions.map((pos) => new Tile(pos.x, pos.y));
  }

  static generateRandomShape(): Shape {
    // Generate a shape with 8 Tiles, all in random but unique positions
    const positions: { x: number; y: number }[] = [];
    // [
    //   { x: 0, y: 0 },
    //   { x: 0, y: 1 },
    //   { x: 0, y: 2 },
    //   { x: 0, y: 3 },
    //   { x: 1, y: 4 },
    //   { x: 1, y: 5 },
    //   { x: 1, y: 6 },
    //   { x: 1, y: 7 },
    // ];
    while (positions.length < 8) {
      const x = Math.floor(Math.random() * 8);
      const y = Math.floor(Math.random() * 8);
      if (!positions.some((pos) => pos.x === x && pos.y === y)) {
        positions.push({ x, y });
      }
    }
    return new Shape(positions);
  }

  static async generateShapesFromRanking(
    ranking: "easy" | "medium" | "hard"
  ): Promise<{ shapes: Shape[]; puzzleIndex: number }> {
    // Read the Ranking.txt file
    await loadRankings();

    // If easy, find a random line that ends with 12 or greater
    // If medium, find a random line that ends with 6-10
    // If hard, find a random line that ends with less than 6
    const lines = rankings.trim().split("\n");
    const filteredLinesWithIndex = lines
      .map((line, index) => ({ line, originalIndex: index }))
      .filter(({ line }) => {
        const parts = line.trim().split(" ");
        const score = parseInt(parts[parts.length - 1]);
        if (ranking === "easy") {
          return score >= 12;
        } else if (ranking === "medium") {
          return score >= 6 && score < 12;
        } else if (ranking === "hard") {
          return score < 6;
        }
      });

    if (filteredLinesWithIndex.length === 0) {
      throw new Error(`No shapes found for ranking: ${ranking}`);
    }

    // Now that the lines are filtered, create positions from the first 8 numbers
    // The first 8 numbers represent indexes of a 2D grid (0-63)
    const randomIndex = Math.floor(
      Math.random() * filteredLinesWithIndex.length
    );
    const selectedEntry = filteredLinesWithIndex[randomIndex];
    const selectedLine = selectedEntry.line;
    const puzzleIndex = selectedEntry.originalIndex + 1; // 1-based index
    const parts = selectedLine.trim().split(" ");
    // The selected line will have 64 numbers, 8 shapes of 8 numbers each
    // Create all 8 shapes and put them in an array
    const shapes: Shape[] = [];

    // Shuffle the colors array to randomize which color goes to which shape
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 8; i++) {
      const positions: { x: number; y: number }[] = [];
      // Each shape gets 8 tiles from parts[i*8] to parts[i*8+7]
      for (let j = 0; j < 8; j++) {
        const index = parseInt(parts[i * 8 + j]);
        const x = index % 8;
        const y = Math.floor(index / 8);
        positions.push({ x, y });
      }
      shapes.push(new Shape(positions, shuffledColors[i]));
    }
    return { shapes, puzzleIndex };
  }

  static async generateShapesFromPuzzleIndex(
    puzzleIndex: number
  ): Promise<{ shapes: Shape[]; puzzleIndex: number }> {
    // Read the Ranking.txt file
    await loadRankings();

    const lines = rankings.trim().split("\n");
    // puzzleIndex is 1-based, convert to 0-based for array access
    const lineIndex = puzzleIndex - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) {
      throw new Error(
        `Invalid puzzle index: ${puzzleIndex}. Must be between 1 and ${lines.length}`
      );
    }

    const selectedLine = lines[lineIndex];
    const parts = selectedLine.trim().split(" ");

    // Create all 8 shapes and put them in an array
    const shapes: Shape[] = [];

    // Shuffle the colors array to randomize which color goes to which shape
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 8; i++) {
      const positions: { x: number; y: number }[] = [];
      // Each shape gets 8 tiles from parts[i*8] to parts[i*8+7]
      for (let j = 0; j < 8; j++) {
        const index = parseInt(parts[i * 8 + j]);
        const x = index % 8;
        const y = Math.floor(index / 8);
        positions.push({ x, y });
      }
      shapes.push(new Shape(positions, shuffledColors[i]));
    }
    return { shapes, puzzleIndex };
  }

  static duplicate(s: Shape): Shape {
    return new Shape(
      s.getTiles().map((tile: Tile) => {
        return { x: tile.getX(), y: tile.getY() };
      }),
      s.color
    );
  }

  getColor() {
    return this.color;
  }

  setColor(color: string) {
    this.color = color;
  }

  rotate(clockwise: boolean) {
    // Rotate the shape 90 clockwise or counter-clockwise around the center of itself
    // Find the center of the shape (average of x and y)
    const xs = this.tiles.map((tile) => tile.getX());
    const ys = this.tiles.map((tile) => tile.getY());
    const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const centerY = ys.reduce((a, b) => a + b, 0) / ys.length;

    this.tiles = this.tiles.map((tile) => {
      const x = tile.getX() - centerX;
      const y = tile.getY() - centerY;
      let newX: number, newY: number;
      if (clockwise) {
        newX = -y;
        newY = x;
      } else {
        newX = y;
        newY = -x;
      }
      // Move back to original center and round to nearest integer
      return new Tile(Math.round(newX + centerX), Math.round(newY + centerY));
    });
  }

  flip(horizontal: boolean) {
    // Flip the shape horizontally or vertically around the center of itself
    const xs = this.tiles.map((tile) => tile.getX());
    const ys = this.tiles.map((tile) => tile.getY());
    const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const centerY = ys.reduce((a, b) => a + b, 0) / ys.length;

    this.tiles = this.tiles.map((tile) => {
      const x = tile.getX();
      const y = tile.getY();
      let newX = x,
        newY = y;
      if (horizontal) {
        newX = Math.round(2 * centerX - x);
      } else {
        newY = Math.round(2 * centerY - y);
      }
      return new Tile(newX, newY);
    });
  }

  getTiles() {
    return this.tiles;
  }

  getIsActive() {
    return this.isActive;
  }

  setIsActive(active: boolean) {
    this.isActive = active;
  }

  hasTileAt(x: number, y: number): boolean {
    return this.tiles.some((tile) => {
      const pos = tile.getPosition();
      return pos.x === x && pos.y === y;
    });
  }

  interpolate(deltaX: number, deltaY: number) {
    let outOfBounds = false;
    const newTiles = this.tiles.map((tile) => {
      const pos = tile.getPosition();
      if (
        pos.x + deltaX < 0 ||
        pos.x + deltaX >= GRID_TILES ||
        pos.y + deltaY < 0 ||
        pos.y + deltaY >= GRID_TILES
      ) {
        // No tiles should be interpolated if any of them go out of bounds
        outOfBounds = true;
      }
      return new Tile(pos.x + deltaX, pos.y + deltaY);
    });
    if (!outOfBounds) {
      this.tiles = newTiles;
    }
  }

  toString(): string {
    return `Shape(color=${this.color}, tiles=[${this.tiles
      .map((t) => `(${t.getX()},${t.getY()})`)
      .join(", ")}])`;
  }
}
