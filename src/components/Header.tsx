import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Backdrop from "@mui/material/Backdrop";
import { HelpModal } from "./HelpModal";

export const Header = () => {
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
          padding: "16px 32px" /* Padding on top/bottom and left/right */,
          boxSizing: "border-box",
        }}
      >
        {/* Centered logo */}
        <Box
          component="img"
          src="/logo.png"
          alt="Logo"
          sx={{
            height: 80,
            // maxWidth: "200px",
            objectFit: "contain",
          }}
        />

        {/* Help button in top right */}
        <IconButton
          onClick={() => setShowHelpModal(true)}
          sx={{
            position: "absolute",
            right: 48,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          aria-label="help"
          size="medium"
        >
          <HelpOutlineIcon fontSize="medium" />
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
