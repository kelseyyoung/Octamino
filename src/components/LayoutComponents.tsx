import Stack, { type StackProps } from "@mui/material/Stack";

export const CenteredColumnStack = ({
  spacing = 2,
  width = "100%",
  children,
  ...props
}: StackProps) => (
  <Stack
    direction="column"
    useFlexGap
    width={width}
    sx={{ alignItems: "center", justifyContent: "center", ...props.sx }}
    spacing={spacing}
    {...props}
  >
    {children}
  </Stack>
);

export const CenteredRowStack = ({
  spacing = 2,
  width = "100%",
  children,
  ...props
}: StackProps) => (
  <Stack
    direction="row"
    useFlexGap
    width={width}
    sx={{ alignItems: "center", justifyContent: "center", ...props.sx }}
    spacing={spacing}
    {...props}
  >
    {children}
  </Stack>
);
