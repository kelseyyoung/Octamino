/**
 * Canvas rendering hooks
 * Handles canvas setup, drawing, and visual effects
 */

import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { Grid } from "../objects/Grid";

export type UseCanvasSetupProps = {
  dynamicTileSize: number;
  dynamicPadding: number;
  grid: RefObject<Grid>;
};

/**
 * Sets up canvas for high DPI displays and handles resizing
 */
export function useCanvasSetup({
  dynamicTileSize,
  dynamicPadding,
  grid,
}: UseCanvasSetupProps) {
  useEffect(() => {
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
  }, [dynamicTileSize, dynamicPadding, grid]);
}

export type UseRedrawProps = {
  dynamicTileSize: number;
  dynamicPadding: number;
  setCanGoToNextShape: (canGo: boolean) => void;
  setCanUndo: (canUndo: boolean) => void;
  setIsLastShape: (isLast: boolean) => void;
};

/**
 * Creates a redraw callback that updates the canvas and game state
 */
export function useRedraw({
  dynamicTileSize,
  dynamicPadding,
  setCanGoToNextShape,
  setCanUndo,
  setIsLastShape,
}: UseRedrawProps) {
  return useCallback(
    (grid: RefObject<Grid>) => {
      const canvas = document.getElementById(
        "canvas-grid"
      ) as HTMLCanvasElement;
      grid.current.draw(canvas, dynamicTileSize, dynamicPadding);
      setCanGoToNextShape(!grid.current.hasOverlappingShapes());
      setCanUndo(grid.current.getShapes().length > 1);
      setIsLastShape(grid.current.getShapes().length === 8);
    },
    [
      dynamicTileSize,
      dynamicPadding,
      setCanGoToNextShape,
      setCanUndo,
      setIsLastShape,
    ]
  );
}

export type UseInitialDrawProps = {
  grid: RefObject<Grid>;
  redraw: (grid: RefObject<Grid>) => void;
};

/**
 * Handles initial canvas draw on mount
 */
export function useInitialDraw({ grid, redraw }: UseInitialDrawProps) {
  useEffect(() => {
    redraw(grid);
  }, [grid, redraw]);
}

export type UseKaleidoscopeEffectProps = {
  hasWon: boolean;
  grid: RefObject<Grid>;
  dynamicTileSize: number;
  dynamicPadding: number;
  redraw: (grid: RefObject<Grid>) => void;
  setShowWinModal: (show: boolean) => void;
};

/**
 * Handles the kaleidoscope animation effect when player wins
 */
export function useKaleidoscopeEffect({
  hasWon,
  grid,
  dynamicTileSize,
  dynamicPadding,
  redraw,
  setShowWinModal,
}: UseKaleidoscopeEffectProps) {
  const hasPlayedAnimation = useRef(false);

  useEffect(() => {
    // Reset the flag when a new game starts (hasWon becomes false)
    if (!hasWon) {
      hasPlayedAnimation.current = false;
      return;
    }

    // Don't play animation if already played for this win
    if (!grid.current || hasPlayedAnimation.current) return;

    // Mark that we're playing the animation
    hasPlayedAnimation.current = true;

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

    // Cleanup timeout and interval when component unmounts
    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [hasWon, grid, dynamicTileSize, dynamicPadding, redraw, setShowWinModal]);
}
