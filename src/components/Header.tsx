import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Backdrop from "@mui/material/Backdrop";
import { HelpModal } from "./HelpModal";

interface HeaderProps {
  onAutoComplete: () => void;
  gameStarted: boolean;
}

export const Header = ({ onAutoComplete, gameStarted }: HeaderProps) => {
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 16px" /* Reduced padding for compact header */,
          paddingTop: "8px",
          boxSizing: "border-box",
        }}
      >
        {/* Auto button in top left - only show when game is started */}
        {gameStarted && (
          <Button
            onClick={onAutoComplete}
            variant="outlined"
            size="small"
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              minWidth: "auto",
              px: 1.5,
            }}
            aria-label="autocomplete"
          >
            Auto
          </Button>
        )}

        {/* Centered logo */}
        <Box
          component="img"
          src={`${import.meta.env.BASE_URL}NewLogo.png`}
          alt="Logo"
          sx={{
            height: { xs: 40, sm: 50 }, // Smaller logo on mobile, larger on desktop
            objectFit: "contain",
          }}
        />

        {/* Help button in top right */}
        <IconButton
          onClick={() => setShowHelpModal(true)}
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          aria-label="help"
          size="small"
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Help Modal with Backdrop */}
      <Backdrop
        open={showHelpModal}
        onClick={() => setShowHelpModal(false)}
        sx={{ zIndex: 999 }}
      >
        <Box onClick={(e) => e.stopPropagation()}>
          <HelpModal onClose={() => setShowHelpModal(false)} />
        </Box>
      </Backdrop>
    </>
  );
};
