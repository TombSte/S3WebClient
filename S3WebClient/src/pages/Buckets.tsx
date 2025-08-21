import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Fab,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
  Edit,
  Delete,
  ContentCopy,
  PlayArrow,
  Cloud,
  Security,
  Settings,
  CheckCircle,
  Error,
  Info,
} from "@mui/icons-material";
import { useS3Connections } from "../hooks/useS3Connections";
import ConnectionForm from "../components/ConnectionForm";
import type {
  S3Connection,
  S3ConnectionForm,
  ConnectionTestResult,
} from "../types/s3";

const Buckets: React.FC = () => {
  const {
    connections,
    loading,
    addConnection,
    updateConnection,
    deleteConnection,
    duplicateConnection,
    testConnection,
    testConnectionConfig,
    searchConnections,
    clearError,
  } = useS3Connections();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConnections, setFilteredConnections] = useState<
    S3Connection[]
  >([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConnection, setEditingConnection] =
    useState<S3Connection | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Search and filter connections
  React.useEffect(() => {
    if (searchTerm.trim()) {
      searchConnections(searchTerm).then(setFilteredConnections);
    } else {
      setFilteredConnections(connections);
    }
  }, [searchTerm, connections, searchConnections]);

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
      const result = await testConnection(id);
      setSnackbar({
        open: true,
        message: result.success
          ? result.message
          : `${result.message}${result.error ? `: ${result.error}` : ""}`,
        severity: result.success ? "success" : "error",
      });
    } catch (err) {
      console.error("Error testing connection:", err);
      setSnackbar({
        open: true,
        message: "Errore nel test della connessione",
        severity: "error",
      });
    }
  };

  const handleFormTest = async (
    formData: S3ConnectionForm
  ): Promise<ConnectionTestResult> => {
    return await testConnectionConfig(formData);
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
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
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
            Gestione Connessioni S3
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Configura e gestisci le tue connessioni a storage S3-compatibili
          </Typography>
        </Box>

        {/* Search and Actions Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            p: 1.5,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <TextField
            placeholder="Cerca connessioni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ alignSelf: "center", mr: 1 }}
            >
              {filteredConnections.length} connessioni
            </Typography>
          </Box>
        </Box>

        {/* Connections Grid */}
        {filteredConnections.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "divider",
            }}
          >
            <Cloud sx={{ fontSize: 56, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nessuna connessione trovata
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm
                ? "Prova a modificare i termini di ricerca"
                : "Crea la tua prima connessione S3-compatibile"}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                  },
                }}
              >
                Prima Connessione
              </Button>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 2,
            }}
          >
            {filteredConnections.map((connection) => (
              <Box key={connection.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    {/* Connection Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          component="h3"
                          sx={{
                            fontWeight: "bold",
                            color: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <StorageIcon sx={{ fontSize: 18 }} />
                          {connection.displayName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5, fontSize: "0.875rem" }}
                        >
                          {connection.endpoint}
                        </Typography>
                      </Box>

                      {/* Status Chips */}
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Chip
                          label={
                            connection.isActive === 1 ? "Attiva" : "Inattiva"
                          }
                          color={
                            connection.isActive === 1 ? "success" : "default"
                          }
                          size="small"
                          icon={
                            connection.isActive === 1 ? (
                              <CheckCircle />
                            ) : (
                              <Error />
                            )
                          }
                        />
                        <Chip
                          label={
                            connection.testStatus === "success"
                              ? "Connesso"
                              : connection.testStatus === "failed"
                              ? "Errore"
                              : "Non testato"
                          }
                          color={getStatusColor(connection.testStatus)}
                          size="small"
                          icon={
                            connection.testStatus === "success" ? (
                              <CheckCircle />
                            ) : connection.testStatus === "failed" ? (
                              <Error />
                            ) : (
                              <Info />
                            )
                          }
                        />
                      </Box>
                    </Box>

                    {/* Connection Details */}
                    <Box sx={{ mb: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Cloud sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          Bucket: {connection.bucketName}
                        </Typography>
                      </Box>

                      {connection.region && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Settings
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.875rem" }}
                          >
                            Regione: {connection.region}
                          </Typography>
                        </Box>
                      )}

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Security
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          Path Style: {connection.pathStyle === 1 ? "Sì" : "No"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Environment Badge */}
                    <Box sx={{ mb: 1.5 }}>
                      <Chip
                        label={connection.environment.toUpperCase()}
                        color={
                          connection.environment === "prod"
                            ? "error"
                            : connection.environment === "test"
                            ? "warning"
                            : connection.environment === "dev"
                            ? "success"
                            : "info"
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>

                  {/* Action Buttons */}
                  <CardActions sx={{ p: 1.5, pt: 0, gap: 0.5 }}>
                    <Tooltip title="Testa Connessione">
                      <IconButton
                        size="small"
                        onClick={() => handleTest(connection.id)}
                        sx={{
                          color: "success.main",
                          "&:hover": { bgcolor: "success.50" },
                        }}
                      >
                        <PlayArrow />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Duplica">
                      <IconButton
                        size="small"
                        onClick={() => handleDuplicate(connection.id)}
                        sx={{
                          color: "info.main",
                          "&:hover": { bgcolor: "info.50" },
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Modifica">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(connection)}
                        sx={{
                          color: "primary.main",
                          "&:hover": { bgcolor: "primary.50" },
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Elimina">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(connection.id)}
                        sx={{
                          color: "error.main",
                          "&:hover": { bgcolor: "error.50" },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleOpenDialog()}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            boxShadow: "0 4px 20px rgba(33, 150, 243, 0.4)",
            "&:hover": {
              background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <AddIcon />
        </Fab>

        {/* Connection Form Dialog */}
        <ConnectionForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          onTest={handleFormTest}
          editingConnection={editingConnection}
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Buckets;
