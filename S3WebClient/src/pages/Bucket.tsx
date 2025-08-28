import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Drawer,
  Button,
  Alert,
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
import UploadObjectDialog from "../components/UploadObjectDialog";
import CreateFolderDialog from "../components/CreateFolderDialog";

export default function Bucket() {
  const { id } = useParams();
  const [connection, setConnection] = useState<S3Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
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
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!connection) {
    return (
      <Box sx={{ width: "100%", minWidth: "100%" }}>
        <Typography>Bucket not found</Typography>
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
        textAlign: "left",
        alignItems: "stretch",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 2, color: 'primary.main', fontWeight: 'bold' }}
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
            Bucket details and contents
          </Typography>
        </Box>

        {connection.testStatus !== "success" && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bucket not connected. Upload and download operations are disabled.
          </Alert>
        )}
        {/* File navigation */}
        <Card
          sx={{
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            mt: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "primary.main", fontWeight: "bold" }}
          >
            Bucket contents
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => setNewFolderOpen(true)}
            sx={{ mr: 1 }}
            disabled={connection.testStatus !== "success"}
          >
            New folder
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => setUploadOpen(true)}
            sx={{ mr: 1 }}
            disabled={connection.testStatus !== "success"}
          >
            Upload
          </Button>
          <IconButton
            aria-label="refresh"
            onClick={() => browserRef.current?.refresh()}
          >
            <RefreshIcon />
          </IconButton>
            </Box>
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
              <ObjectBrowser
                ref={browserRef}
                connection={connection}
                disableActions={connection.testStatus !== "success"}
              />
            </Box>
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
      <UploadObjectDialog
        open={uploadOpen}
        connection={connection}
        onClose={() => setUploadOpen(false)}
        onUploaded={async () => {
          await browserRef.current?.refresh();
        }}
      />
      <CreateFolderDialog
        open={newFolderOpen}
        connection={connection}
        onClose={() => setNewFolderOpen(false)}
        onCreated={async () => {
          await browserRef.current?.refresh();
        }}
      />
    </Box>
  );
}
