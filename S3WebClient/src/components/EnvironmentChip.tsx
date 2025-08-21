import { Chip } from "@mui/material";
import React from "react";

interface Props {
  environment: string;
  size?: "small" | "medium";
}

const EnvironmentChip: React.FC<Props> = ({ environment, size = "small" }) => {
  const color =
    environment === "prod"
      ? "error"
      : environment === "test"
      ? "warning"
      : environment === "dev"
      ? "success"
      : "info";

  return (
    <Chip
      label={environment.toUpperCase()}
      color={color}
      size={size}
      variant="outlined"
    />
  );
};

export default EnvironmentChip;
