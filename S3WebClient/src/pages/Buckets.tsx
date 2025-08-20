import React, { useState } from "react";
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Fab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  PlayArrow as TestIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { useS3Connections } from "../hooks/useS3Connections";
import ConnectionForm from "../components/ConnectionForm";
import type { S3Connection, S3ConnectionForm } from "../types/s3";

const Buckets: React.FC = () => {
  const {
    connections,
    loading,
    error,
    addConnection,
    updateConnection,
    deleteConnection,
    duplicateConnection,
    testConnection,
    searchConnections,
    clearError,
  } = useS3Connections();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConnections, setFilteredConnections] = useState<
    S3Connection[]
  >([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConnection, setEditingConnection] =
    useState<S3Connection | null>(null);

  // Search and filter connections
  React.useEffect(() => {
    if (searchQuery.trim()) {
      searchConnections(searchQuery).then(setFilteredConnections);
    } else {
      setFilteredConnections(connections);
    }
  }, [searchQuery, connections, searchConnections]);

  const handleOpenDialog = (connection?: S3Connection) => {
    setEditingConnection(connection || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConnection(null);
    clearError();
  };

  const handleSubmit = async (formData: S3ConnectionForm) => {
    try {
      if (editingConnection) {
        await updateConnection(editingConnection.id, formData);
      } else {
        await addConnection(formData);
      }
    } catch (err) {
      console.error("Error saving connection:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa connessione?")) {
      try {
        await deleteConnection(id);
      } catch (err) {
        console.error("Error deleting connection:", err);
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateConnection(id);
    } catch (err) {
      console.error("Error duplicating connection:", err);
    }
  };

  const handleTest = async (id: string) => {
    try {
      await testConnection(id);
    } catch (err) {
      console.error("Error testing connection:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case "prod":
        return "error";
      case "test":
        return "warning";
      case "dev":
        return "info";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", minWidth: "100%" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Buckets
        </Typography>
        <Typography>Caricamento connessioni...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Buckets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuova Connessione
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Cerca connessioni per nome, bucket o endpoint..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Connections List */}
      {filteredConnections.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <StorageIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nessuna connessione configurata
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clicca su "Nuova Connessione" per iniziare a configurare i tuoi
            bucket S3
          </Typography>
        </Paper>
      ) : (
        <List>
          {filteredConnections.map((connection) => (
            <Paper key={connection.id} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6">
                        {connection.displayName}
                      </Typography>
                      <Chip
                        label={connection.environment.toUpperCase()}
                        color={getEnvironmentColor(connection.environment)}
                        size="small"
                      />
                      <Chip
                        label={connection.testStatus}
                        color={getStatusColor(connection.testStatus)}
                        size="small"
                      />
                      {connection.isActive === 0 && (
                        <Chip
                          label="DISABILITATA"
                          color="default"
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Bucket:</strong> {connection.bucketName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Endpoint:</strong> {connection.endpoint}
                        {connection.region && ` (${connection.region})`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Path Style:</strong>{" "}
                        {connection.pathStyle === 1 ? "Sì" : "No"}
                      </Typography>
                      {connection.lastTested && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Ultimo test:</strong>{" "}
                          {connection.lastTested.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      edge="end"
                      onClick={() => handleTest(connection.id)}
                      title="Testa connessione"
                    >
                      <TestIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDuplicate(connection.id)}
                      title="Duplica connessione"
                    >
                      <CopyIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog(connection)}
                      title="Modifica connessione"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(connection.id)}
                      title="Elimina connessione"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      {/* Connection Form Dialog */}
      <ConnectionForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        editingConnection={editingConnection}
      />

      {/* Error Display */}
      {error && (
        <Paper
          sx={{
            p: 2,
            mt: 2,
            bgcolor: "error.light",
            color: "error.contrastText",
          }}
        >
          <Typography>{error}</Typography>
          <Button onClick={clearError} sx={{ mt: 1 }}>
            Chiudi
          </Button>
        </Paper>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Buckets;
