/**
 * GameStartScreen component
 * Displays the puzzle number input, difficulty selector, and start button
 */

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CenteredColumnStack, CenteredRowStack } from "./LayoutComponents";
import { isPuzzleNumberInvalid, MAX_PUZZLE_NUMBER } from "../utils/gameUtils";

export type GameStartScreenProps = {
  puzzleNumber: string;
  setPuzzleNumber: (value: string) => void;
  difficulty: "easy" | "medium" | "hard";
  setDifficulty: (value: "easy" | "medium" | "hard") => void;
  isLoading: boolean;
  onStartGame: () => void;
};

export function GameStartScreen({
  puzzleNumber,
  setPuzzleNumber,
  difficulty,
  setDifficulty,
  isLoading,
  onStartGame,
}: GameStartScreenProps) {
  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setDifficulty(event.target.value as "easy" | "medium" | "hard");
  };

  return (
    <CenteredColumnStack spacing={2} width="100%">
      {/* Row with input box and difficulty dropdown */}
      <CenteredRowStack spacing={1} width="100%" alignItems="flex-start">
        <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500, color: "text.primary" }}
          >
            Puzzle #
          </Typography>
          <TextField
            value={puzzleNumber}
            onChange={(e) => setPuzzleNumber(e.target.value)}
            size="small"
            fullWidth
            type="number"
            autoComplete="off"
            disabled={isLoading}
            error={isPuzzleNumberInvalid(puzzleNumber)}
            sx={{
              "& .MuiInputBase-input::placeholder": {
                opacity: 0.6,
              },
              "& input[type=number]::-webkit-outer-spin-button": {
                WebkitAppearance: "none",
                margin: 0,
              },
              "& input[type=number]::-webkit-inner-spin-button": {
                WebkitAppearance: "none",
                margin: 0,
              },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">#</InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Typography
          sx={{
            px: 1,
            variant: "body2",
            flexShrink: 0,
            mt: 3,
          }}
        >
          or
        </Typography>
        <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500, color: "text.primary" }}
          >
            Difficulty
          </Typography>
          <Select
            value={difficulty}
            onChange={handleDifficultyChange}
            size="small"
            fullWidth
            disabled={isLoading || !!puzzleNumber}
          >
            <MenuItem value={"easy"}>Easy</MenuItem>
            <MenuItem value={"medium"}>Medium</MenuItem>
            <MenuItem value={"hard"}>Hard</MenuItem>
          </Select>
        </Box>
      </CenteredRowStack>
      {/* Start button below */}
      <Box sx={{ width: "100%" }}>
        <Button
          onClick={onStartGame}
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading || isPuzzleNumberInvalid(puzzleNumber)}
          sx={{
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Start"}
        </Button>
        {isPuzzleNumberInvalid(puzzleNumber) && (
          <Typography
            variant="caption"
            sx={{
              color: "error.main",
              mt: 0.5,
              display: "block",
              textAlign: "center",
            }}
          >
            Puzzle # must be between 1 and {MAX_PUZZLE_NUMBER}
          </Typography>
        )}
      </Box>
    </CenteredColumnStack>
  );
}
