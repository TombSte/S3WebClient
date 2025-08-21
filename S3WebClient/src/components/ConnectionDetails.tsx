import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import React from "react";
import type { S3Connection } from "../types/s3";
import TestStatusChip from "./TestStatusChip";
import EnvironmentChip from "./EnvironmentChip";

interface Props {
  connection: S3Connection;
}

const ConnectionDetails: React.FC<Props> = ({ connection }) => {
  return (
    <Card sx={{ mb: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
        >
          Informazioni principali
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Endpoint
            </Typography>
            <Typography variant="body1">{connection.endpoint}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Bucket
            </Typography>
            <Typography variant="body1">{connection.bucketName}</Typography>
          </Box>

          {connection.region && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Regione
              </Typography>
              <Typography variant="body1">{connection.region}</Typography>
            </Box>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary">
              Environment
            </Typography>
            <EnvironmentChip environment={connection.environment} />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Stato
            </Typography>
            <Chip
              label={connection.isActive === 1 ? "Attiva" : "Inattiva"}
              color={connection.isActive === 1 ? "success" : "default"}
              size="small"
              icon={
                connection.isActive === 1 ? <CheckCircle /> : <ErrorIcon />
              }
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Test
            </Typography>
            <TestStatusChip status={connection.testStatus} />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Ultimo test
            </Typography>
            <Typography variant="body1">
              {connection.lastTested
                ? new Date(connection.lastTested).toLocaleString()
                : "Mai"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Modalità URL
            </Typography>
            <Typography variant="body1">
              {connection.pathStyle === 1 ? "Path-style" : "Virtual-hosted"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConnectionDetails;
