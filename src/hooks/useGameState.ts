/**
 * Game state management hooks
 * Handles timer, keyboard controls, and responsive layout
 */

import { useEffect } from "react";
import { calculateResponsiveLayout } from "../utils/screenSizes";
import type { MoveShapeDirection } from "../objects/Grid";

export type UseGameTimerProps = {
  gameStarted: boolean;
  hasWon: boolean;
  setElapsedTime: (fn: (prev: number) => number) => void;
};

/**
 * Manages the game timer that increments every second
 */
export function useGameTimer({
  gameStarted,
  hasWon,
  setElapsedTime,
}: UseGameTimerProps) {
  useEffect(() => {
    if (!gameStarted || hasWon) return;

    const intervalId = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameStarted, hasWon, setElapsedTime]);
}

export type UseKeyboardControlsProps = {
  gameStarted: boolean;
  hasWon: boolean;
  rotateActiveShape: (clockwise: boolean) => void;
  flipActiveShape: (horizontal: boolean) => void;
  nextShape: () => void;
  moveActiveShape: (direction: MoveShapeDirection) => void;
  undo: () => void;
};

/**
 * Handles keyboard shortcuts for game controls
 */
export function useKeyboardControls({
  gameStarted,
  hasWon,
  rotateActiveShape,
  flipActiveShape,
  nextShape,
  moveActiveShape,
  undo,
}: UseKeyboardControlsProps) {
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (!gameStarted || hasWon) return;

      // Ignore if any modifier keys are pressed
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        return;

      // Only handle game control keys
      const gameKeys = [
        "r",
        "e",
        "f",
        "v",
        "n",
        "u",
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
        case "u":
          undo();
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
    undo,
  ]);
}

export type UseResponsiveLayoutProps = {
  setDynamicTileSize: (size: number) => void;
  setDynamicPadding: (padding: number) => void;
  setGridSize: (size: number) => void;
  setUseVerticalControlLayout: (vertical: boolean) => void;
  setButtonSize: (size: "small" | "medium" | "large") => void;
  setControlSpacing: (spacing: { inner: number; outer: number }) => void;
};

/**
 * Manages responsive layout calculations based on viewport size
 */
export function useResponsiveLayout({
  setDynamicTileSize,
  setDynamicPadding,
  setGridSize,
  setUseVerticalControlLayout,
  setButtonSize,
  setControlSpacing,
}: UseResponsiveLayoutProps) {
  useEffect(() => {
    const updateLayout = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const layout = calculateResponsiveLayout(viewportWidth, viewportHeight);

      setDynamicTileSize(layout.dynamicTileSize);
      setDynamicPadding(layout.dynamicPadding);
      setGridSize(layout.gridSize);
      setUseVerticalControlLayout(layout.useVerticalControlLayout);
      setButtonSize(layout.buttonSize);
      setControlSpacing(layout.controlSpacing);
    };

    updateLayout();

    // Add resize listener
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [
    setDynamicTileSize,
    setDynamicPadding,
    setGridSize,
    setUseVerticalControlLayout,
    setButtonSize,
    setControlSpacing,
  ]);
}
