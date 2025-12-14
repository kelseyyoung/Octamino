import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useState, useEffect } from "react";

// Demo shapes for the animation - Using puzzle from NewRanking.txt line 12814
// This shape has a nice scattered, non-connected pattern
const DEMO_SHAPES = [
  { color: "#FD9301", tiles: [0, 1, 8, 9, 16, 20, 28, 32] }, // Shape 1: Orange
  { color: "#FFFF00", tiles: [2, 3, 10, 11, 18, 22, 30, 34] }, // Shape 2: Yellow
  { color: "#23FA00", tiles: [4, 5, 12, 13, 17, 21, 25, 37] }, // Shape 3: Green
  { color: "#FD40FF", tiles: [6, 7, 14, 15, 19, 23, 27, 39] }, // Shape 4: Pink
  { color: "#27FDFF", tiles: [24, 36, 40, 44, 48, 49, 56, 57] }, // Shape 5: Cyan
  { color: "#0A32FF", tiles: [26, 38, 42, 46, 50, 51, 58, 59] }, // Shape 6: Blue
  { color: "#FD2600", tiles: [29, 33, 41, 45, 52, 53, 60, 61] }, // Shape 7: Red
  { color: "#7030A0", tiles: [31, 35, 43, 47, 54, 55, 62, 63] }, // Shape 8: Purple
];

function AnimatedGrid({ isActive }: { isActive: boolean }) {
  const [visibleShapes, setVisibleShapes] = useState(0);

  useEffect(() => {
    if (!isActive) {
      // Stop animation and reset when not active
      setVisibleShapes(0);
      return;
    }

    // Reset and start animation when component becomes active
    setVisibleShapes(0);

    let timeoutId: number | undefined;

    const scheduleNextUpdate = (currentShapes: number) => {
      // If we've shown all shapes, pause longer before resetting
      const delay = currentShapes >= DEMO_SHAPES.length ? 2000 : 800;

      timeoutId = setTimeout(() => {
        setVisibleShapes((prev) => {
          const next = prev >= DEMO_SHAPES.length ? 0 : prev + 1;
          scheduleNextUpdate(next);
          return next;
        });
      }, delay);
    };

    scheduleNextUpdate(0);

    return () => clearTimeout(timeoutId);
  }, [isActive]);

  // Create an 8x8 grid map
  const gridMap: (string | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  // Fill grid with only the visible shapes
  for (let i = 0; i < visibleShapes; i++) {
    const shape = DEMO_SHAPES[i];
    shape.tiles.forEach((tileIndex) => {
      const x = tileIndex % 8;
      const y = Math.floor(tileIndex / 8);
      gridMap[y][x] = shape.color;
    });
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          {gridMap.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((color, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: color || "#fff",
                    border: "1px solid #333",
                    transition: "background-color 0.3s ease",
                  }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

type HelpModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

export const HelpModal = ({ isVisible, onClose }: HelpModalProps) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        borderRadius: 2,
        width: "calc(100% - 32px)", // Take up most horizontal space with margins
        maxWidth: "600px",
        maxHeight: "90vh", // Increased from 80vh
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="How to Play" disableRipple />
        <Tab label="About" disableRipple />
      </Tabs>
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

      {tabValue === 0 && (
        <Box>
          <Typography variant="body1">
            You'll be given a shape made of 8 tiles. The goal of the puzzle is
            to fill the entire grid with 8 instances of that same shape without
            any overlaps or gaps
          </Typography>
          <AnimatedGrid isActive={tabValue === 0 && isVisible} />
          <Typography variant="body1">
            You'll have to move, rotate, and flip the shapes to solve the puzzle
          </Typography>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Shortcuts
          </Typography>
          <Typography variant="body1" component="div">
            <Box>
              <strong>Movement</strong>
              <p>Arrow keys or W/A/S/D to move the active shape</p>
            </Box>
            <Box>
              <strong>Rotation</strong>
              <p>
                R - Rotate right
                <br />E - Rotate left
              </p>
            </Box>
            <Box>
              <strong>Flip</strong>
              <p>
                F - Flip horizontal
                <br />V - Flip vertical
              </p>
            </Box>
            <Box>
              <strong>Other</strong>
              <p>
                N - Next shape (once positioned)
                <br />U - Undo
              </p>
            </Box>
          </Typography>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1">
            <strong>Octamino</strong> is the brainchild of Tom Young, math
            teacher now retired, who when remodeling his bathroom asked this
            question -{" "}
            <strong>"How can I create a tiling pattern for the shower?"</strong>
          </Typography>
          <Typography variant="body1">
            His novel idea was to find how many ways the <strong>n^2</strong>{" "}
            squares of a <strong>n x n</strong> square could be configured with{" "}
            <strong>n</strong> identical groups of <strong>n</strong> tiles
            where the <strong>n</strong> tiles did not have to be connected
          </Typography>
          <Typography variant="body1">
            After drawing the possibilities for a 2 x 2 square, then a 3 x 3
            square, and exasperatingly trying to draw the possibilities for the
            4 x 4, he wrote a program to find the answer
          </Typography>
          <Typography variant="body1">
            There are 60 configurations for the 4 x 4 square, only 1 way to tile
            the 5 x 5 square, 102 ways for the 6 x 6, only 1 way for the 7 x 7,
            and 62714 ways for the 8 x 8
          </Typography>
          <Typography variant="body1">
            These are pictured at the{" "}
            <a
              href="https://oeis.org/A363381"
              target="_blank"
              rel="noopener noreferrer"
            >
              Online Encyclopedia of Integer Sequences (OEIS) entry A363381
            </a>
          </Typography>
          <Typography variant="body1">
            Along with his daughter, Kelsey, Tom developed this puzzle using the
            62714 solutions of the 8 x 8 square
          </Typography>
          <Typography variant="body1">
            There are outstanding mathematical questions. For instance, is 1 the
            number of solutions for a <strong>n x n</strong> square when{" "}
            <strong>n</strong> is prime? Is there an explicit formula to predict
            the number of solutions? What are the answers for{" "}
            <strong>n &gt; 8</strong>? What are the 3D analogues?
          </Typography>
        </Box>
      )}
    </Box>
  );
};
