import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal = ({ onClose }: HelpModalProps) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxWidth: "600px",
        maxHeight: "80vh",
        overflow: "auto",
        zIndex: 1000,
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

      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        How to Play
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        🎯 Objective
      </Typography>
      <Typography variant="body1" paragraph>
        Fill the entire 8x8 grid with shapes without any overlaps or gaps!
      </Typography>

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        🎮 Controls
      </Typography>
      <Typography variant="body1" component="div">
        <Box sx={{ mb: 1 }}>
          <strong>Movement:</strong>
          <ul style={{ marginTop: 4 }}>
            <li>Arrow keys or W/A/S/D to move the active shape</li>
          </ul>
        </Box>
        <Box sx={{ mb: 1 }}>
          <strong>Rotation:</strong>
          <ul style={{ marginTop: 4 }}>
            <li>R - Rotate right</li>
            <li>E - Rotate left</li>
          </ul>
        </Box>
        <Box sx={{ mb: 1 }}>
          <strong>Flip:</strong>
          <ul style={{ marginTop: 4 }}>
            <li>F - Flip horizontal</li>
            <li>V - Flip vertical</li>
          </ul>
        </Box>
        <Box>
          <strong>Other:</strong>
          <ul style={{ marginTop: 4 }}>
            <li>N - Next shape (once positioned)</li>
          </ul>
        </Box>
      </Typography>

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        📋 Game Rules
      </Typography>
      <Typography variant="body1" component="div">
        <ul style={{ marginTop: 4 }}>
          <li>Position each shape on the grid one at a time</li>
          <li>Shapes cannot overlap with previously placed shapes</li>
          <li>Use rotation and flipping to fit shapes into tight spaces</li>
          <li>You can undo your last move if needed</li>
          <li>Complete the puzzle by filling the entire grid</li>
        </ul>
      </Typography>
    </Box>
  );
};
