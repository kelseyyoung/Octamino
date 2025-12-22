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
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { formatTime } from "../utils/gameUtils";
import type { Shape } from "../objects/Shape";

/**
 * Calculate star rating based on completion time (in seconds)
 * 4 stars: < 90 seconds (< 1.5 minutes)
 * 3 stars: 90-179 seconds (1.5-3 minutes)
 * 2 stars: 180-269 seconds (3-4.5 minutes)
 * 1 star: 270-360 seconds (4.5-6 minutes)
 * 0 stars: > 360 seconds (> 6 minutes)
 */
function getStarRating(elapsedTime: number): number {
  if (elapsedTime < 90) return 4;
  if (elapsedTime < 180) return 3;
  if (elapsedTime < 270) return 2;
  if (elapsedTime <= 360) return 1;
  return 0;
}

export type WinModalProps = {
  show: boolean;
  elapsedTime: number;
  puzzleIndex: number;
  difficulty: "Easy" | "Medium" | "Hard";
  onPlayAgain: () => void;
};

export function WinModal({
  show,
  elapsedTime,
  puzzleIndex,
  difficulty,
  onPlayAgain,
}: WinModalProps) {
  const stars = getStarRating(elapsedTime);

  return (
    <Slide direction="up" in={show} timeout={500}>
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 3,
          p: 3,
          borderRadius: 2,
          maxWidth: "600px",
          minWidth: "300px",
          mx: "auto",
          textAlign: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Octamino!
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="body1">#{puzzleIndex}</Typography>
            <Typography variant="body2" color="text.secondary">
              {difficulty}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                }}
              >
                <TimerOutlined sx={{ mt: "-2px" }} fontSize="small" />
                <Typography variant="body1">
                  {formatTime(elapsedTime)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "center", gap: 0.25 }}
              >
                {Array.from({ length: 4 }, (_, index) => {
                  return index < stars ? (
                    <Box
                      key={index}
                      sx={{ position: "relative", display: "inline-flex" }}
                    >
                      <StarIcon fontSize="small" sx={{ color: "gold" }} />
                      <StarBorderIcon
                        fontSize="small"
                        sx={{
                          color: "text.secondary",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                      />
                    </Box>
                  ) : (
                    <StarBorderIcon
                      key={index}
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
        <Button
          color="primary"
          variant="contained"
          onClick={onPlayAgain}
          size="large"
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
