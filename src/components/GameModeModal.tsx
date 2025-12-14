/**
 * GameModeModal component
 * Displays modal for selecting game mode (Daily or Freeplay)
 */

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

type GameModeModalProps = {
  onSelectMode: (mode: "daily" | "freeplay") => void;
};

export function GameModeModal({ onSelectMode }: GameModeModalProps) {
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
        minWidth: "300px",
        maxWidth: "400px",
        zIndex: 1000,
        textAlign: "center",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Daily mode button - disabled */}
        <Box sx={{ position: "relative" }}>
          <Button
            variant="contained"
            fullWidth
            disabled
            sx={{
              py: 2,
              fontSize: "1.1rem",
            }}
          >
            Daily
          </Button>
          <Chip
            label="Coming soon"
            size="small"
            sx={{
              position: "absolute",
              top: -10,
              right: -10,
              bgcolor: "primary.main",
              color: "white",
            }}
          />
        </Box>

        {/* Freeplay mode button */}
        <Button
          variant="outlined"
          fullWidth
          onClick={() => onSelectMode("freeplay")}
          sx={{
            py: 2,
            fontSize: "1.1rem",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          Freeplay
        </Button>
      </Box>
    </Box>
  );
}
