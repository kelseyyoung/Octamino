/**
 * Utility functions for the game
 */

export const MAX_PUZZLE_NUMBER = 62642;

/**
 * Validates if a puzzle number string is valid
 */
export function isPuzzleNumberInvalid(puzzleNumber: string): boolean {
  if (puzzleNumber === "") return false;
  const num = Number(puzzleNumber);
  return isNaN(num) || num < 1 || num > MAX_PUZZLE_NUMBER;
}

/**
 * Formats seconds into MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Tooltip configuration for offset positioning
 */
export const tooltipOffset = {
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
