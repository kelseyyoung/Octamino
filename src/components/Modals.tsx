/**
 * Modal components for the game
 * Contains WinModal and SolutionModal
 */

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { formatTime } from "../utils/gameUtils";
import type { Shape } from "../objects/Shape";

export type WinModalProps = {
  show: boolean;
  elapsedTime: number;
  puzzleIndex: number;
  buttonSize: "small" | "medium" | "large";
  onPlayAgain: () => void;
};

export function WinModal({
  show,
  elapsedTime,
  puzzleIndex,
  buttonSize,
  onPlayAgain,
}: WinModalProps) {
  return (
    <Slide direction="up" in={show} timeout={500}>
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 3,
          p: 3,
          borderRadius: 2,
          maxWidth: "600px",
          mx: "auto",
          textAlign: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Octamino!
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          You solved puzzle #{puzzleIndex} in {formatTime(elapsedTime)}
        </Typography>
        <Button
          color="primary"
          variant="contained"
          onClick={onPlayAgain}
          size={buttonSize}
          sx={{
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
            px: 4,
            py: 1.5,
          }}
        >
          Play again
        </Button>
      </Box>
    </Slide>
  );
}

export type SolutionModalProps = {
  show: boolean;
  solutionShapes: Shape[];
  onClose: () => void;
};

export function SolutionModal({
  show,
  solutionShapes,
  onClose,
}: SolutionModalProps) {
  if (!show) return null;

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "background.paper",
        boxShadow: 3,
        p: 2,
        borderRadius: 2,
        mt: 3,
        maxWidth: "400px",
        mx: "auto",
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h5" sx={{ textAlign: "center", marginTop: 0 }}>
        Solution
      </Typography>
      <SolutionTable shapes={solutionShapes} />
    </Box>
  );
}

type SolutionTableProps = {
  shapes: Shape[];
};

function SolutionTable({ shapes }: SolutionTableProps) {
  if (shapes.length === 0) return null;

  // Create an 8x8 grid map to store which color belongs to each cell
  const gridMap: (string | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  // Fill the grid map with colors from each shape
  shapes.forEach((shape) => {
    shape.getTiles().forEach((tile) => {
      const x = tile.getX();
      const y = tile.getY();
      if (x >= 0 && x < 8 && y >= 0 && y < 8) {
        gridMap[y][x] = shape.getColor();
      }
    });
  });

  return (
    <table style={{ borderCollapse: "collapse", margin: "auto" }}>
      <tbody>
        {gridMap.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((color, colIndex) => (
              <td
                key={colIndex}
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: color || "#fff",
                  border: "1px solid #000",
                }}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
