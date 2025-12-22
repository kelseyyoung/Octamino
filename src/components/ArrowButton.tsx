import Button from "@mui/material/Button";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { MoveShapeDirection } from "../objects/Grid";
import type { SxProps, Theme } from "@mui/material/styles";

type ArrowButtonProps = {
  direction: MoveShapeDirection;
  onClick: () => void;
  size?: "small" | "medium" | "large";
  sx?: SxProps<Theme>;
};

const directionConfig: Record<
  MoveShapeDirection,
  {
    icon: typeof ArrowUpwardIcon;
    ariaLabel: string;
  }
> = {
  up: {
    icon: ArrowUpwardIcon,
    ariaLabel: "Move up (W or Arrow Up)",
  },
  down: {
    icon: ArrowDownwardIcon,
    ariaLabel: "Move down (S or Arrow Down)",
  },
  left: {
    icon: ArrowBackIcon,
    ariaLabel: "Move left (A or Arrow Left)",
  },
  right: {
    icon: ArrowForwardIcon,
    ariaLabel: "Move right (D or Arrow Right)",
  },
};

export const ArrowButton = ({ direction, onClick, sx }: ArrowButtonProps) => {
  const config = directionConfig[direction];
  const Icon = config.icon;

  return (
    <Button
      variant="outlined"
      size={"large"}
      onClick={onClick}
      aria-label={config.ariaLabel}
      sx={{
        minWidth: "auto",
        paddingX: 2,
        paddingY: 1,
        ...sx,
      }}
    >
      <Icon />
    </Button>
  );
};
