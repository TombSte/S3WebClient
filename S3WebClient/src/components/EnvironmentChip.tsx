import { Chip } from "@mui/material";
import React from "react";
import { useEnvironments } from "../contexts/EnvironmentsContext";

interface Props {
  environment: string;
  size?: "small" | "medium";
}

const EnvironmentChip: React.FC<Props> = ({ environment, size = "small" }) => {
  const { findByKey } = useEnvironments();
  const env = findByKey(environment);
  const label = env?.name ?? environment.toUpperCase();
  const muiColor = env?.color ?? (environment === "prod"
      ? "error"
      : environment === "test"
      ? "warning"
      : environment === "dev"
      ? "success"
      : "info");

  if (env?.colorHex) {
    return (
      <Chip
        label={label}
        size={size}
        variant="outlined"
        sx={{
          color: env.colorHex,
          borderColor: env.colorHex,
        }}
      />
    );
  }

  return <Chip label={label} color={muiColor} size={size} variant="outlined" />;
};

export default EnvironmentChip;
