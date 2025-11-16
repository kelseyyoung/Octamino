export class Tile {
  private x: number;
  private y: number;
  private color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getColor() {
    return this.color;
  }

  toString(): string {
    return `Tile (x=${this.x}, y=${this.y}, color=${this.color})`;
  }
}
