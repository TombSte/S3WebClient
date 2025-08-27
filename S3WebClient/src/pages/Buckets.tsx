import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  IconButton,
  Fab,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
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
  FolderOpen,
  FilterList,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useS3Connections } from "../hooks/useS3Connections";
import ConnectionForm from "../components/ConnectionForm";
import ConfirmDialog from "../components/ConfirmDialog";
import TestStatusChip from "../components/TestStatusChip";
import EnvironmentChip from "../components/EnvironmentChip";
import SearchBar from "../components/SearchBar";
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

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery("(max-width:600px)");

  const initialStatus = (() => {
    const v = searchParams.get("status");
    return v === "success" || v === "failed" || v === "untested" ? v : "all";
  })();
  const initialActive = (() => {
    const v = searchParams.get("active");
    return v === "active" || v === "inactive" ? v : "all";
  })();
  const initialEnv = (() => {
    const v = searchParams.get("env");
    return v === "dev" || v === "test" || v === "prod" || v === "custom"
      ? v
      : "all";
  })();
  const initialQuery = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [filteredConnections, setFilteredConnections] =
    useState<S3Connection[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "success" | "failed" | "untested"
  >(initialStatus);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >(initialActive);
  const [environmentFilter, setEnvironmentFilter] = useState<
    "all" | "dev" | "test" | "prod" | "custom"
  >(initialEnv);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConnection, setEditingConnection] =
    useState<S3Connection | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; name: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingStatusFilter, setPendingStatusFilter] = useState<
    "all" | "success" | "failed" | "untested"
  >(statusFilter);
  const [pendingActiveFilter, setPendingActiveFilter] = useState<
    "all" | "active" | "inactive"
  >(activeFilter);
  const [pendingEnvironmentFilter, setPendingEnvironmentFilter] = useState<
    "all" | "dev" | "test" | "prod" | "custom"
  >(environmentFilter);

  const connectionNames = React.useMemo(
    () => Array.from(new Set(connections.map((c) => c.displayName))),
    [connections]
  );

  // Sync applied filters/search to URL query params
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (activeFilter !== "all") params.set("active", activeFilter);
    if (environmentFilter !== "all") params.set("env", environmentFilter);
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, activeFilter, environmentFilter, setSearchParams]);

  // Search and filter connections
  React.useEffect(() => {
    const fetchAndFilter = async () => {
      let results: S3Connection[];
      if (searchTerm.trim()) {
        results = await searchConnections(searchTerm);
      } else {
        results = connections;
      }

      results = results.filter((conn) => {
        const statusMatch =
          statusFilter === "all" || conn.testStatus === statusFilter;
        const activeMatch =
          activeFilter === "all" ||
          (activeFilter === "active"
            ? conn.isActive === 1
            : conn.isActive === 0);
        const environmentMatch =
          environmentFilter === "all" ||
          conn.environment === environmentFilter;
        return statusMatch && activeMatch && environmentMatch;
      });

      setFilteredConnections(results);
    };

    fetchAndFilter();
  }, [
    searchTerm,
    connections,
    searchConnections,
    statusFilter,
    activeFilter,
    environmentFilter,
  ]);

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
    const conn = connections.find((c) => c.id === id);
    setConfirmDelete({ open: true, id, name: conn?.displayName || id });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await deleteConnection(confirmDelete.id);
      setSnackbar({ open: true, message: "Connection deleted", severity: "success" });
    } catch (err) {
      console.error("Error deleting connection:", err);
      setSnackbar({ open: true, message: "Error deleting connection", severity: "error" });
    } finally {
      setConfirmDelete(null);
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
        message: "Error testing connection",
        severity: "error",
      });
    }
  };

  const handleFormTest = async (
    formData: S3ConnectionForm
  ): Promise<ConnectionTestResult> => {
    return await testConnectionConfig(formData);
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", minWidth: "100%" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Buckets
        </Typography>
        <Typography>Loading connections...</Typography>
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
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                background:
                  "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              <StorageIcon sx={{ fontSize: 32, color: "primary.main" }} />
              S3 Connections
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              Configure and manage your S3-compatible storage connections
            </Typography>
          </Box>
          <Chip
            icon={<StorageIcon sx={{ color: "inherit" }} />}
            label={`${filteredConnections.length} connections`}
            sx={{
              fontWeight: "bold",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 1,
              "& .MuiChip-icon": { color: "inherit" },
            }}
          />
        </Box>

        {/* Search and Filters Bar */}
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "nowrap",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <SearchBar
                placeholder="Search connections..."
                value={searchInput}
                onChange={setSearchInput}
                onSearch={setSearchTerm}
                suggestions={connectionNames}
                sx={{ mb: 0 }}
              />
            </Box>
            {(() => {
              const activeCount =
                (statusFilter !== "all" ? 1 : 0) +
                (activeFilter !== "all" ? 1 : 0) +
                (environmentFilter !== "all" ? 1 : 0);
              const label = activeCount > 0 ? `Filters (${activeCount})` : "Filters";
              const openFilters = () => {
                setPendingStatusFilter(statusFilter);
                setPendingActiveFilter(activeFilter);
                setPendingEnvironmentFilter(environmentFilter);
                setFiltersOpen(true);
              };
              return (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterList />}
                  onClick={openFilters}
                  sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {label}
                </Button>
              );
            })()}
          </Box>

          {/* Active filters summary chips */}
          {(
            statusFilter !== "all" ||
            activeFilter !== "all" ||
            environmentFilter !== "all"
          ) && (
            <Box
              sx={{
                mt: 1,
                display: "block",
                overflowX: "auto",
                whiteSpace: "nowrap",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {statusFilter !== "all" && (
                <Chip
                  label={`Status: ${
                    statusFilter === "success"
                      ? "OK"
                      : statusFilter === "failed"
                      ? "Error"
                      : "Not tested"
                  }`}
                  onDelete={() => setStatusFilter("all")}
                  size="small"
                  sx={{ mr: 1, mb: 0.5 }}
                />
              )}
              {activeFilter !== "all" && (
                <Chip
                  label={`Active: ${activeFilter === "active" ? "Yes" : "No"}`}
                  onDelete={() => setActiveFilter("all")}
                  size="small"
                  sx={{ mr: 1, mb: 0.5 }}
                />
              )}
              {environmentFilter !== "all" && (
                <Chip
                  label={`Env: ${environmentFilter}`}
                  onDelete={() => setEnvironmentFilter("all")}
                  size="small"
                  sx={{ mr: 1, mb: 0.5 }}
                />
              )}
              <Button
                size="small"
                onClick={() => {
                  setStatusFilter("all");
                  setActiveFilter("all");
                  setEnvironmentFilter("all");
                  setSearchInput("");
                  setSearchTerm("");
                  setSearchParams({}, { replace: true });
                }}
                sx={{ mb: 0.5 }}
              >
                Clear filters
              </Button>
            </Box>
          )}
        </Box>

        {/* Filters Dialog */}
        <Dialog
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          fullScreen={isMobile}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ m: 0, p: 2 }}>
            Filters
            <IconButton
              aria-label="close"
              onClick={() => setFiltersOpen(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              setStatusFilter(pendingStatusFilter);
              setActiveFilter(pendingActiveFilter);
              setEnvironmentFilter(pendingEnvironmentFilter);
              setFiltersOpen(false);
            }}
          >
            <DialogContent dividers>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  label="Status"
                  value={pendingStatusFilter}
                  autoFocus
                  onChange={(e) =>
                    setPendingStatusFilter(e.target.value as typeof pendingStatusFilter)
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="success">OK</MenuItem>
                  <MenuItem value="failed">Error</MenuItem>
                  <MenuItem value="untested">Not tested</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="active-filter-label">Active</InputLabel>
                <Select
                  labelId="active-filter-label"
                  label="Active"
                  value={pendingActiveFilter}
                  onChange={(e) =>
                    setPendingActiveFilter(e.target.value as typeof pendingActiveFilter)
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="env-filter-label">Env</InputLabel>
                <Select
                  labelId="env-filter-label"
                  label="Env"
                  value={pendingEnvironmentFilter}
                  onChange={(e) =>
                    setPendingEnvironmentFilter(
                      e.target.value as typeof pendingEnvironmentFilter
                    )
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="dev">Dev</MenuItem>
                  <MenuItem value="test">Test</MenuItem>
                  <MenuItem value="prod">Prod</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Box>
            </DialogContent>
            <DialogActions>
            <Button
              onClick={() => {
                setPendingStatusFilter("all");
                setPendingActiveFilter("all");
                setPendingEnvironmentFilter("all");
              }}
            >
              Reset
            </Button>
            <Button type="submit" variant="contained">
              Apply
            </Button>
            </DialogActions>
          </Box>
        </Dialog>

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
              No connections found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm
                ? "Try adjusting the search terms"
                : "Create your first S3-compatible connection"}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  boxShadow: 3,
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                  },
                }}
              >
                Create First Connection
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
                  onClick={() => navigate(`/bucket/${connection.id}`)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "primary.50",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
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
                        <TestStatusChip status={connection.testStatus} />
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
                            Region: {connection.region}
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
                          Path Style: {connection.pathStyle === 1 ? "Yes" : "No"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Environment Badge */}
                    <Box sx={{ mb: 1.5 }}>
                      <EnvironmentChip environment={connection.environment} />
                    </Box>
                  </CardContent>

                  {/* Action Buttons */}
                  <CardActions sx={{ p: 1.5, pt: 0, gap: 0.5 }}>
                    <Tooltip title="Open">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/bucket/${connection.id}`);
                        }}
                        sx={{
                          color: "secondary.main",
                          "&:hover": { bgcolor: "secondary.50" },
                        }}
                      >
                        <FolderOpen />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Test Connection">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTest(connection.id);
                        }}
                        sx={{
                          color: "success.main",
                          "&:hover": { bgcolor: "success.50" },
                        }}
                      >
                        <PlayArrow />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Duplicate">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(connection.id);
                        }}
                        sx={{
                          color: "info.main",
                          "&:hover": { bgcolor: "info.50" },
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(connection);
                        }}
                        sx={{
                          color: "primary.main",
                          "&:hover": { bgcolor: "primary.50" },
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(connection.id);
                        }}
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
            boxShadow: 6,
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
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
        <ConfirmDialog
          open={Boolean(confirmDelete?.open)}
          title="Delete connection"
          message={`Delete connection ${confirmDelete?.name}?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteAction}
        />
      </Box>
    </Box>
  );
};

export default Buckets;
