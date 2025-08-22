import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Drawer,
} from "@mui/material";
import {
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  InfoOutlined,
} from "@mui/icons-material";
import ConnectionDetails from "../components/ConnectionDetails";
import EnvironmentChip from "../components/EnvironmentChip";
import type { S3Connection } from "../types/s3";
import { connectionRepository } from "../repositories";
import ObjectBrowser, { type ObjectBrowserHandle } from "../components/ObjectBrowser";

export default function Bucket() {
  const { id } = useParams();
  const [connection, setConnection] = useState<S3Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const browserRef = useRef<ObjectBrowserHandle>(null);

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
            <IconButton
              aria-label="info"
              size="small"
              onClick={() => setDetailsOpen(true)}
            >
              <InfoOutlined />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Dettagli del bucket e contenuti
          </Typography>
        </Box>

        {/* File navigation */}
        <Card sx={{ boxShadow: "0 2px 10px rgba(0,0,0,0.08)", mt: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ flexGrow: 1, color: "primary.main", fontWeight: "bold" }}
              >
                Contenuti del bucket
              </Typography>
              <IconButton
                aria-label="refresh"
                onClick={() => browserRef.current?.refresh()}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
            <ObjectBrowser ref={browserRef} connection={connection} />
          </CardContent>
        </Card>
        <Drawer
          anchor="right"
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        >
          <Box sx={{ width: 320, p: 2 }}>
            <ConnectionDetails connection={connection} compact />
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
}
