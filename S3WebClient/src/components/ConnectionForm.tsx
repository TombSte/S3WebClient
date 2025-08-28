import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Cloud,
  Key,
  Lock,
  Storage,
  Language,
  Settings,
  Close,
} from "@mui/icons-material";
import type {
  S3Connection,
  S3ConnectionForm,
  ConnectionTestResult,
} from "../types/s3";
import { useEnvironments } from "../contexts/EnvironmentsContext";

interface ConnectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: S3ConnectionForm) => Promise<void>;
  onTest: (formData: S3ConnectionForm) => Promise<ConnectionTestResult>;
  editingConnection: S3Connection | null;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({
  open,
  onClose,
  onSubmit,
  onTest,
  editingConnection,
}) => {
  const { environments } = useEnvironments();
  const [formData, setFormData] = React.useState<S3ConnectionForm>({
    displayName: "",
    environment: "dev",
    endpoint: "",
    region: undefined,
    accessKeyId: "",
    secretAccessKey: "",
    bucketName: "",
    pathStyle: 1,
    metadata: {},
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [testing, setTesting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Initialize form when editing
  React.useEffect(() => {
    if (editingConnection) {
      setFormData({
        displayName: editingConnection.displayName,
        environment: editingConnection.environment,
        endpoint: editingConnection.endpoint,
        region: editingConnection.region,
        accessKeyId: editingConnection.accessKeyId,
        secretAccessKey: editingConnection.secretAccessKey,
        bucketName: editingConnection.bucketName,
        pathStyle: editingConnection.pathStyle,
        metadata: { ...editingConnection.metadata },
      });
    } else {
      // pick first visible env if available, fallback to 'dev'
      const defaultEnv = environments[0]?.key ?? "dev";
      setFormData({
        displayName: "",
        environment: defaultEnv,
        endpoint: "",
        region: undefined,
        accessKeyId: "",
        secretAccessKey: "",
        bucketName: "",
        pathStyle: 1,
        metadata: {},
      });
    }
    setErrors({});
    setSnackbar({ open: false, message: "", severity: "success" });
  }, [editingConnection, open, environments]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!formData.endpoint.trim()) {
      newErrors.endpoint = "Endpoint is required";
    } else if (
      !formData.endpoint.startsWith("http://") &&
      !formData.endpoint.startsWith("https://")
    ) {
      newErrors.endpoint = "Endpoint must start with http:// or https://";
    }

    if (!formData.accessKeyId.trim()) {
      newErrors.accessKeyId = "Access Key ID is required";
    }

    if (!formData.secretAccessKey.trim()) {
      newErrors.secretAccessKey = "Secret Access Key is required";
    }

    if (!formData.bucketName.trim()) {
      newErrors.bucketName = "Bucket name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit(formData);
        onClose();
      } catch (err) {
        console.error("Error submitting form:", err);
      }
    }
  };

  const handleTest = async () => {
    if (validateForm()) {
      try {
        setTesting(true);
        const result = await onTest(formData);
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
      } finally {
        setTesting(false);
      }
    }
  };

  const handleClose = () => {
    setErrors({});
    setSnackbar({ open: false, message: "", severity: "success" });
    onClose();
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
          pb: 2,
          flexShrink: 0,
        }}
      >
        <Cloud sx={{ fontSize: 28 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="div">
            {editingConnection ? "Edit Connection" : "New Connection"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {editingConnection
              ? "Update existing connection parameters"
              : "Configure a new S3-compatible connection"}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <DialogContent sx={{ p: 3, overflow: "auto", flex: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Basic Information Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "primary.main",
                }}
              >
                <Storage sx={{ fontSize: 18 }} />
                Basic Information
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Display Name"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  fullWidth
                  required
                  error={!!errors.displayName}
                  helperText={errors.displayName}
                  InputProps={{
                    startAdornment: (
                      <Storage sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Environment</InputLabel>
                  <Select
                    value={formData.environment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          environment: e.target.value as string,
                        })
                      }
                    label="Environment"
                  >
                    {environments.map((env) => (
                      <MenuItem key={env.key} value={env.key}>
                        {env.colorHex ? (
                          <Chip
                            label={env.name}
                            size="small"
                            sx={{ mr: 1, color: env.colorHex, borderColor: env.colorHex }}
                            variant="outlined"
                          />
                        ) : (
                          <Chip label={env.name} size="small" color={env.color} sx={{ mr: 1 }} />
                        )}
                        {env.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider />

            {/* Connection Details Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "primary.main",
                }}
              >
                <Language sx={{ fontSize: 18 }} />
                Connection Details
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Endpoint"
                  value={formData.endpoint}
                  onChange={(e) =>
                    setFormData({ ...formData, endpoint: e.target.value })
                  }
                  fullWidth
                  required
                  placeholder="https://minio.example.com:9000"
                  error={!!errors.endpoint}
                  helperText={errors.endpoint || "Endpoint of your S3-compatible storage (e.g., MinIO, Ceph, etc.)"}
                  InputProps={{
                    startAdornment: (
                      <Language sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />

                <TextField
                  label="Region (optional)"
                  value={formData.region || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      region: e.target.value || undefined,
                    })
                  }
                  fullWidth
                  placeholder="us-east-1 (only for AWS S3)"
                  helperText="Required only for AWS S3. For MinIO and other S3-compatible storage it can be left empty."
                  InputProps={{
                    startAdornment: (
                      <Settings sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />

                <TextField
                  label="Bucket Name"
                  value={formData.bucketName}
                  onChange={(e) =>
                    setFormData({ ...formData, bucketName: e.target.value })
                  }
                  fullWidth
                  required
                  error={!!errors.bucketName}
                  helperText={errors.bucketName}
                  InputProps={{
                    startAdornment: (
                      <Storage sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Sensitive fields with additional protection */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "error.main",
                }}
              >
                <Lock sx={{ fontSize: 18 }} />
                Access Credentials
              </Typography>

              <Box
                sx={{
                  p: 2.5,
                  border: "2px solid",
                  borderColor: "error.light",
                  borderRadius: 2,
                  bgcolor: "error.50",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -1,
                    left: -1,
                    right: -1,
                    bottom: -1,
                    borderRadius: 2,
                    background: "linear-gradient(45deg, #ff6b6b, #ee5a24)",
                    zIndex: -1,
                  },
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Access Key ID"
                    value={formData.accessKeyId}
                    onChange={(e) =>
                      setFormData({ ...formData, accessKeyId: e.target.value })
                    }
                    fullWidth
                    required
                    type="text"
                    autoComplete="off"
                    inputProps={{
                      "data-lpignore": "true",
                      "data-form-type": "other",
                      "data-1p-ignore": "true",
                    }}
                    error={!!errors.accessKeyId}
                    helperText={errors.accessKeyId}
                    InputProps={{
                      startAdornment: (
                        <Key sx={{ mr: 1, color: "error.main" }} />
                      ),
                    }}
                  />

                  <TextField
                    label="Secret Access Key"
                    value={formData.secretAccessKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secretAccessKey: e.target.value,
                      })
                    }
                    fullWidth
                    required
                    type="password"
                    autoComplete="new-password"
                    inputProps={{
                      "data-lpignore": "true",
                      "data-form-type": "other",
                      "data-1p-ignore": "true",
                      "data-cy": "secret-key-input",
                    }}
                    error={!!errors.secretAccessKey}
                    helperText={errors.secretAccessKey}
                    InputProps={{
                      startAdornment: (
                        <Lock sx={{ mr: 1, color: "error.main" }} />
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Advanced Options Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "primary.main",
                }}
              >
                <Settings sx={{ fontSize: 18 }} />
                Advanced Options
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.pathStyle === 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pathStyle: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                }
                label="Path Style (instead of Virtual Hosted)"
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "transparent",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: "primary.main",
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : theme.palette.grey[50],
            flexShrink: 0,
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{ px: 2.5, py: 1, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTest}
            variant="outlined"
            disabled={testing}
            sx={{ px: 2.5, py: 1, borderRadius: 2 }}
          >
            {testing ? "Testing..." : "Test Connection"}
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 2,
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
              },
            }}
          >
            {editingConnection ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
  </>
  );
};

export default ConnectionForm;
