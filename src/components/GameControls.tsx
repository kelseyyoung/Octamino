/**
 * GameControls component
 * Displays all game controls: next/undo buttons, arrow buttons, rotate/flip buttons
 */

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { CenteredColumnStack, CenteredRowStack } from "./LayoutComponents";
import { ArrowButton } from "./ArrowButton";
import { tooltipOffset, formatTime } from "../utils/gameUtils";
import type { MoveShapeDirection } from "../objects/Grid";

export type GameControlsProps = {
  puzzleIndex: number;
  difficultyLabel: "Easy" | "Medium" | "Hard";
  elapsedTime: number;
  canGoToNextShape: boolean;
  canUndo: boolean;
  isLastShape: boolean;
  buttonSize: "small" | "medium" | "large";
  controlSpacing: { inner: number; outer: number };
  useVerticalControlLayout: boolean;
  onNextShape: () => void;
  onUndo: () => void;
  onMoveActiveShape: (direction: MoveShapeDirection) => void;
  onRotateActiveShape: (clockwise: boolean) => void;
  onFlipActiveShape: (horizontal: boolean) => void;
};

export function GameControls({
  puzzleIndex,
  difficultyLabel,
  elapsedTime,
  canGoToNextShape,
  canUndo,
  isLastShape,
  buttonSize,
  controlSpacing,
  useVerticalControlLayout,
  onNextShape,
  onUndo,
  onMoveActiveShape,
  onRotateActiveShape,
  onFlipActiveShape,
}: GameControlsProps) {
  return (
    <CenteredColumnStack spacing={1}>
      {/* Puzzle number and timer row */}
      <CenteredRowStack spacing={2} width="100%" sx={{ mb: 0.5 }}>
        <Typography
          sx={{
            flex: 3,
            textAlign: "left",
            variant: "body2",
          }}
        >
          Puzzle #{puzzleIndex} - {difficultyLabel}
        </Typography>
        <Typography
          sx={{
            flex: 1,
            textAlign: "right",
            variant: "body2",
          }}
        >
          {formatTime(elapsedTime)}
        </Typography>
      </CenteredRowStack>

      {/* Next shape and Undo buttons */}
      <CenteredRowStack sx={{ mb: 2 }}>
        <Button
          color="primary"
          variant="contained"
          onClick={onNextShape}
          disabled={!canGoToNextShape}
          size={buttonSize}
          aria-label={isLastShape ? "Finish puzzle (N)" : "Next shape (N)"}
          sx={{
            flexGrow: 3,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          {isLastShape ? "Finish" : "Next shape"}
        </Button>
        <Button
          onClick={onUndo}
          variant="outlined"
          disabled={!canUndo}
          size={buttonSize}
          aria-label="Undo (U)"
          sx={{
            flexGrow: 1,
          }}
        >
          Undo
        </Button>
      </CenteredRowStack>

      {/* Directional and transform controls */}
      {useVerticalControlLayout ? (
        <VerticalControls
          buttonSize={buttonSize}
          controlSpacing={controlSpacing}
          onMoveActiveShape={onMoveActiveShape}
          onRotateActiveShape={onRotateActiveShape}
          onFlipActiveShape={onFlipActiveShape}
        />
      ) : (
        <HorizontalControls
          buttonSize={buttonSize}
          controlSpacing={controlSpacing}
          onMoveActiveShape={onMoveActiveShape}
          onRotateActiveShape={onRotateActiveShape}
          onFlipActiveShape={onFlipActiveShape}
        />
      )}
    </CenteredColumnStack>
  );
}

type ControlsLayoutProps = {
  buttonSize: "small" | "medium" | "large";
  controlSpacing: { inner: number; outer: number };
  onMoveActiveShape: (direction: MoveShapeDirection) => void;
  onRotateActiveShape: (clockwise: boolean) => void;
  onFlipActiveShape: (horizontal: boolean) => void;
};

// Reusable sub-components
type DirectionalPadProps = {
  buttonSize: "small" | "medium" | "large";
  spacing: number;
  onMoveActiveShape: (direction: MoveShapeDirection) => void;
  wrapInBox?: boolean;
};

function DirectionalPad({
  buttonSize,
  spacing,
  onMoveActiveShape,
  wrapInBox = false,
}: DirectionalPadProps) {
  const ArrowButtonWrapper = wrapInBox ? Box : "div";
  const wrapperProps = wrapInBox ? {} : { style: { display: "contents" } };

  return (
    <CenteredColumnStack spacing={spacing}>
      <CenteredRowStack spacing={spacing}>
        <ArrowButtonWrapper {...wrapperProps}>
          <ArrowButton
            direction="up"
            onClick={() => onMoveActiveShape("up")}
            size={buttonSize}
          />
        </ArrowButtonWrapper>
      </CenteredRowStack>
      <CenteredRowStack spacing={spacing}>
        <ArrowButtonWrapper {...wrapperProps}>
          <ArrowButton
            direction="left"
            onClick={() => onMoveActiveShape("left")}
            size={buttonSize}
          />
        </ArrowButtonWrapper>
        <ArrowButtonWrapper {...wrapperProps}>
          <ArrowButton
            direction="right"
            onClick={() => onMoveActiveShape("right")}
            size={buttonSize}
          />
        </ArrowButtonWrapper>
      </CenteredRowStack>
      <CenteredRowStack spacing={spacing}>
        <ArrowButtonWrapper {...wrapperProps}>
          <ArrowButton
            direction="down"
            onClick={() => onMoveActiveShape("down")}
            size={buttonSize}
          />
        </ArrowButtonWrapper>
      </CenteredRowStack>
    </CenteredColumnStack>
  );
}

type RotateButtonsProps = {
  buttonSize: "small" | "medium" | "large";
  onRotateActiveShape: (clockwise: boolean) => void;
  minWidth?: string;
};

function RotateButtons({
  buttonSize,
  onRotateActiveShape,
  minWidth,
}: RotateButtonsProps) {
  return (
    <>
      <Tooltip title="Rotate left" placement="top" slotProps={tooltipOffset}>
        <Button
          variant="outlined"
          onClick={() => onRotateActiveShape(false)}
          size={buttonSize}
          aria-label="Rotate left (E)"
          sx={minWidth ? { minWidth } : undefined}
        >
          <Rotate90DegreesCwIcon className={"rotate-left"} />
        </Button>
      </Tooltip>
      <Tooltip title="Rotate right" placement="top" slotProps={tooltipOffset}>
        <Button
          variant="outlined"
          onClick={() => onRotateActiveShape(true)}
          size={buttonSize}
          aria-label="Rotate right (R)"
          sx={minWidth ? { minWidth } : undefined}
        >
          <Rotate90DegreesCwIcon />
        </Button>
      </Tooltip>
    </>
  );
}

type FlipButtonsProps = {
  buttonSize: "small" | "medium" | "large";
  onFlipActiveShape: (horizontal: boolean) => void;
  minWidth?: string;
};

function FlipButtons({
  buttonSize,
  onFlipActiveShape,
  minWidth,
}: FlipButtonsProps) {
  return (
    <>
      <Tooltip
        title="Flip horizontal"
        placement="bottom"
        slotProps={tooltipOffset}
      >
        <Button
          variant="outlined"
          onClick={() => onFlipActiveShape(true)}
          size={buttonSize}
          aria-label="Flip horizontal (F)"
          sx={minWidth ? { minWidth } : undefined}
        >
          <SwapHorizIcon />
        </Button>
      </Tooltip>
      <Tooltip
        title="Flip vertical"
        placement="bottom"
        slotProps={tooltipOffset}
      >
        <Button
          variant="outlined"
          onClick={() => onFlipActiveShape(false)}
          size={buttonSize}
          aria-label="Flip vertical (V)"
          sx={minWidth ? { minWidth } : undefined}
        >
          <SwapVertIcon />
        </Button>
      </Tooltip>
    </>
  );
}

function VerticalControls({
  buttonSize,
  controlSpacing,
  onMoveActiveShape,
  onRotateActiveShape,
  onFlipActiveShape,
}: ControlsLayoutProps) {
  return (
    <CenteredColumnStack width="100%" spacing={controlSpacing.outer}>
      {/* Arrow buttons */}
      <DirectionalPad
        buttonSize={buttonSize}
        spacing={controlSpacing.inner}
        onMoveActiveShape={onMoveActiveShape}
        wrapInBox={true}
      />

      {/* Rotate and Flip buttons */}
      <CenteredColumnStack spacing={controlSpacing.inner}>
        <CenteredRowStack spacing={controlSpacing.inner}>
          <RotateButtons
            buttonSize={buttonSize}
            onRotateActiveShape={onRotateActiveShape}
            minWidth="80px"
          />
        </CenteredRowStack>
        <CenteredRowStack spacing={controlSpacing.inner}>
          <FlipButtons
            buttonSize={buttonSize}
            onFlipActiveShape={onFlipActiveShape}
            minWidth="80px"
          />
        </CenteredRowStack>
      </CenteredColumnStack>
    </CenteredColumnStack>
  );
}

function HorizontalControls({
  buttonSize,
  controlSpacing,
  onMoveActiveShape,
  onRotateActiveShape,
  onFlipActiveShape,
}: ControlsLayoutProps) {
  return (
    <CenteredRowStack width="70%" spacing={controlSpacing.outer}>
      {/* Left directional controls */}
      <CenteredColumnStack spacing={controlSpacing.inner} sx={{ flexGrow: 1 }}>
        <DirectionalPad
          buttonSize={buttonSize}
          spacing={controlSpacing.inner}
          onMoveActiveShape={onMoveActiveShape}
        />
      </CenteredColumnStack>

      {/* Right transform controls */}
      <CenteredColumnStack spacing={controlSpacing.inner} sx={{ flexGrow: 1 }}>
        <CenteredRowStack spacing={controlSpacing.inner}>
          <RotateButtons
            buttonSize={buttonSize}
            onRotateActiveShape={onRotateActiveShape}
          />
        </CenteredRowStack>
        <CenteredRowStack spacing={controlSpacing.inner}>
          <FlipButtons
            buttonSize={buttonSize}
            onFlipActiveShape={onFlipActiveShape}
          />
        </CenteredRowStack>
      </CenteredColumnStack>
    </CenteredRowStack>
  );
}
