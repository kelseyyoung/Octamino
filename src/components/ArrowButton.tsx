import Button from "@mui/material/Button";
import Tooltip, { type TooltipProps } from "@mui/material/Tooltip";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { MoveShapeDirection } from "../objects/Grid";

interface ArrowButtonProps {
  direction: MoveShapeDirection;
  onClick: () => void;
}

const tooltipOffset = {
  popper: {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, -10],
        },
      },
    ],
  },
};

const directionConfig: Record<
  MoveShapeDirection,
  {
    icon: typeof ArrowUpwardIcon;
    tooltip: string;
    placement: TooltipProps["placement"];
  }
> = {
  up: {
    icon: ArrowUpwardIcon,
    tooltip: "Move up",
    placement: "top",
  },
  down: {
    icon: ArrowDownwardIcon,
    tooltip: "Move down",
    placement: "bottom",
  },
  left: {
    icon: ArrowBackIcon,
    tooltip: "Move left",
    placement: "left",
  },
  right: {
    icon: ArrowForwardIcon,
    tooltip: "Move right",
    placement: "right",
  },
};

export const ArrowButton = ({ direction, onClick }: ArrowButtonProps) => {
  const config = directionConfig[direction];
  const Icon = config.icon;

  return (
    <Tooltip
      title={config.tooltip}
      placement={config.placement}
      slotProps={tooltipOffset}
    >
      <Button
        variant="outlined"
        size="small"
        onClick={onClick}
        sx={{
          minWidth: "auto",
          padding: 0.5,
        }}
      >
        <Icon color="primary" />
      </Button>
    </Tooltip>
  );
};
