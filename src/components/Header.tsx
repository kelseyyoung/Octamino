import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GradingIcon from "@mui/icons-material/Grading";
import Backdrop from "@mui/material/Backdrop";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { HelpModal } from "./HelpModal";

type HeaderProps = {
  onAutoComplete: () => void;
  onRestart: () => void;
  gameStarted: boolean;
  showModeModal: boolean;
};

export const Header = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAutoComplete,
  onRestart,
  gameStarted,
  showModeModal,
}: HeaderProps) => {
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showRestartDialog, setShowRestartDialog] = useState<boolean>(false);

  const handleRestartClick = () => {
    if (gameStarted) {
      // Show confirmation dialog if game is in progress
      setShowRestartDialog(true);
    } else {
      // Just go back if we're only on the start screen
      onRestart();
    }
  };

  const handleRestartConfirm = () => {
    setShowRestartDialog(false);
    onRestart();
  };

  const handleRestartCancel = () => {
    setShowRestartDialog(false);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 16px",
          paddingTop: "8px",
          boxSizing: "border-box",
        }}
      >
        {/* Back button - show when mode modal is hidden */}
        {!showModeModal && (
          <Box
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <Button
              onClick={handleRestartClick}
              variant="outlined"
              size="small"
              sx={{
                minWidth: "auto",
                px: 1.5,
              }}
              aria-label="Restart game"
            >
              <ArrowBackIcon fontSize="small" />
            </Button>
          </Box>
        )}

        {/* Auto button - only show when game is started */}
        {gameStarted && (
          <Box
            sx={{
              position: "absolute",
              left: 60,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <Button
              onClick={onAutoComplete}
              variant="outlined"
              size="small"
              sx={{
                minWidth: "auto",
                px: 1.5,
                visibility: "hidden",
              }}
              aria-label="Autocomplete puzzle"
            >
              <GradingIcon fontSize="small" />
            </Button>
          </Box>
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
        <Button
          onClick={() => setShowHelpModal(true)}
          variant="outlined"
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            minWidth: "auto",
          }}
          aria-label="help"
          size="small"
        >
          <QuestionMarkIcon fontSize="small" />
        </Button>
      </Box>

      {/* Help Modal with Backdrop */}
      <Backdrop
        open={showHelpModal}
        onClick={() => setShowHelpModal(false)}
        sx={{ zIndex: 999 }}
      >
        <Box onClick={(e) => e.stopPropagation()}>
          <HelpModal
            isVisible={showHelpModal}
            onClose={() => setShowHelpModal(false)}
          />
        </Box>
      </Backdrop>

      {/* Restart Confirmation Dialog */}
      <Dialog
        open={showRestartDialog}
        onClose={handleRestartCancel}
        aria-labelledby="restart-dialog-title"
        aria-describedby="restart-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="restart-dialog-description">
            Go back to the start screen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleRestartConfirm}
            color="primary"
            variant="contained"
            autoFocus
          >
            Yes
          </Button>
          <Button onClick={handleRestartCancel} color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
