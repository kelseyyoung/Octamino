/**
 * GameControls component
 * Displays all game controls: next/undo buttons, arrow buttons, rotate/flip buttons
 */

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
  controlSpacing,
  useVerticalControlLayout,
  onNextShape,
  onUndo,
  onMoveActiveShape,
  onRotateActiveShape,
  onFlipActiveShape,
}: GameControlsProps) {
  return (
    <CenteredColumnStack spacing={1} sx={{ flex: 1 }}>
      {/* Puzzle number and timer row */}
      <CenteredRowStack spacing={2} width="100%">
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
      <CenteredRowStack sx={{ mb: 0.5 }}>
        <Button
          color="primary"
          variant="contained"
          onClick={onNextShape}
          disabled={!canGoToNextShape}
          size="large"
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
          size="large"
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
          controlSpacing={controlSpacing}
          onMoveActiveShape={onMoveActiveShape}
          onRotateActiveShape={onRotateActiveShape}
          onFlipActiveShape={onFlipActiveShape}
        />
      ) : (
        <HorizontalControls
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
  controlSpacing: { inner: number; outer: number };
  onMoveActiveShape: (direction: MoveShapeDirection) => void;
  onRotateActiveShape: (clockwise: boolean) => void;
  onFlipActiveShape: (horizontal: boolean) => void;
};

// Reusable sub-components
type DirectionalPadProps = {
  spacing: number;
  vertical?: boolean;
  onMoveActiveShape: (direction: MoveShapeDirection) => void;
};

function DirectionalPad({
  spacing,
  vertical,
  onMoveActiveShape,
}: DirectionalPadProps) {
  const verticalPadding = vertical
    ? { paddingY: 2, paddingX: 3, maxHeight: 52 }
    : undefined;
  return (
    <CenteredColumnStack spacing={spacing}>
      <ArrowButton
        direction="up"
        onClick={() => onMoveActiveShape("up")}
        sx={verticalPadding}
      />
      <CenteredRowStack spacing={spacing}>
        <ArrowButton
          direction="left"
          onClick={() => onMoveActiveShape("left")}
          sx={verticalPadding}
        />
        <ArrowButton
          direction="right"
          onClick={() => onMoveActiveShape("right")}
          sx={verticalPadding}
        />
      </CenteredRowStack>
      <ArrowButton
        direction="down"
        onClick={() => onMoveActiveShape("down")}
        sx={verticalPadding}
      />
    </CenteredColumnStack>
  );
}

type RotateButtonsProps = {
  onRotateActiveShape: (clockwise: boolean) => void;
  minWidth?: string;
};

function RotateButtons({ onRotateActiveShape, minWidth }: RotateButtonsProps) {
  return (
    <>
      <Tooltip title="Rotate left" placement="top" slotProps={tooltipOffset}>
        <Button
          variant="outlined"
          onClick={() => onRotateActiveShape(false)}
          size="large"
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
          size="large"
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
  onFlipActiveShape: (horizontal: boolean) => void;
  minWidth?: string;
};

function FlipButtons({ onFlipActiveShape, minWidth }: FlipButtonsProps) {
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
          size="large"
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
          size="large"
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
  controlSpacing,
  onMoveActiveShape,
  onRotateActiveShape,
  onFlipActiveShape,
}: ControlsLayoutProps) {
  return (
    <CenteredColumnStack
      width="100%"
      spacing={controlSpacing.outer}
      sx={{ flex: 1 }}
    >
      {/* Arrow buttons */}
      <div style={{ flex: 6, display: "flex", justifyContent: "center" }}>
        <DirectionalPad
          spacing={controlSpacing.inner}
          vertical={true}
          onMoveActiveShape={onMoveActiveShape}
        />
      </div>

      {/* Rotate and Flip buttons */}
      <CenteredColumnStack spacing={controlSpacing.inner} sx={{ flex: 4 }}>
        <CenteredRowStack spacing={controlSpacing.inner}>
          <RotateButtons
            onRotateActiveShape={onRotateActiveShape}
            minWidth="80px"
          />
        </CenteredRowStack>
        <CenteredRowStack spacing={controlSpacing.inner}>
          <FlipButtons onFlipActiveShape={onFlipActiveShape} minWidth="80px" />
        </CenteredRowStack>
      </CenteredColumnStack>
    </CenteredColumnStack>
  );
}

function HorizontalControls({
  controlSpacing,
  onMoveActiveShape,
  onRotateActiveShape,
  onFlipActiveShape,
}: ControlsLayoutProps) {
  return (
    <CenteredRowStack spacing={controlSpacing.outer} sx={{ flex: 1 }}>
      {/* Left directional controls */}
      <CenteredColumnStack spacing={controlSpacing.inner} sx={{ flexGrow: 1 }}>
        <DirectionalPad
          spacing={controlSpacing.inner}
          onMoveActiveShape={onMoveActiveShape}
        />
      </CenteredColumnStack>

      {/* Right transform controls */}
      <CenteredColumnStack
        spacing={controlSpacing.inner}
        sx={{ flexGrow: 1, justifyContent: "center" }}
      >
        <CenteredRowStack spacing={controlSpacing.inner}>
          <RotateButtons onRotateActiveShape={onRotateActiveShape} />
        </CenteredRowStack>
        <CenteredRowStack spacing={controlSpacing.inner}>
          <FlipButtons onFlipActiveShape={onFlipActiveShape} />
        </CenteredRowStack>
      </CenteredColumnStack>
    </CenteredRowStack>
  );
}
