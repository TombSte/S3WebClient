import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { Storage as StorageIcon } from "@mui/icons-material";
import ConnectionDetails from "../components/ConnectionDetails";
import EnvironmentChip from "../components/EnvironmentChip";
import type { S3Connection } from "../types/s3";
import { connectionRepository } from "../repositories";

export default function Bucket() {
  const { id } = useParams();
  const [connection, setConnection] = useState<S3Connection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      const conn = await connectionRepository.get(id);
      if (active) {
        setConnection(conn ?? null);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ width: "100%", minWidth: "100%" }}>
        <Typography>Caricamento...</Typography>
      </Box>
    );
  }

  if (!connection) {
    return (
      <Box sx={{ width: "100%", minWidth: "100%" }}>
        <Typography>Bucket non trovato</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        textAlign: "left",
        alignItems: "flex-start",
      }}
    >
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              <StorageIcon sx={{ fontSize: 32, color: "primary.main" }} />
              {connection.displayName}
            </Typography>
            <EnvironmentChip environment={connection.environment} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Dettagli del bucket e contenuti
          </Typography>
        </Box>

        {/* Bucket Info */}
        <ConnectionDetails connection={connection} />

        {/* Placeholder for file navigation */}
        <Card sx={{ boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Contenuti del bucket
            </Typography>
            <Typography variant="body2" color="text.secondary">
              La navigazione dei file e delle cartelle sarà disponibile prossimamente.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
