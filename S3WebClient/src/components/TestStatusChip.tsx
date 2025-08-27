import { Chip } from "@mui/material";
import { CheckCircle, Error as ErrorIcon, Info as InfoIcon } from "@mui/icons-material";
import React from "react";
import type { S3Connection } from "../types/s3";

interface Props {
  status: S3Connection["testStatus"];
  size?: "small" | "medium";
}

const TestStatusChip: React.FC<Props> = ({ status, size = "small" }) => {
  switch (status) {
    case "success":
      return <Chip label="Connected" color="success" size={size} icon={<CheckCircle />} />;
    case "failed":
      return <Chip label="Error" color="error" size={size} icon={<ErrorIcon />} />;
    default:
      return <Chip label="Not tested" color="default" size={size} icon={<InfoIcon />} />;
  }
};

export default TestStatusChip;
