import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
} from "@mui/material";
import type { S3Connection, S3ConnectionForm } from "../types/s3";

interface ConnectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: S3ConnectionForm) => Promise<void>;
  editingConnection: S3Connection | null;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({
  open,
  onClose,
  onSubmit,
  editingConnection,
}) => {
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
      setFormData({
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
    }
    setErrors({});
  }, [editingConnection, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Il nome visuale è obbligatorio";
    }

    if (!formData.endpoint.trim()) {
      newErrors.endpoint = "L'endpoint è obbligatorio";
    } else if (
      !formData.endpoint.startsWith("http://") &&
      !formData.endpoint.startsWith("https://")
    ) {
      newErrors.endpoint = "L'endpoint deve iniziare con http:// o https://";
    }

    if (!formData.accessKeyId.trim()) {
      newErrors.accessKeyId = "L'Access Key ID è obbligatorio";
    }

    if (!formData.secretAccessKey.trim()) {
      newErrors.secretAccessKey = "La Secret Access Key è obbligatoria";
    }

    if (!formData.bucketName.trim()) {
      newErrors.bucketName = "Il nome del bucket è obbligatorio";
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

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingConnection ? "Modifica Connessione" : "Nuova Connessione"}
      </DialogTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nome Visuale"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              fullWidth
              required
              error={!!errors.displayName}
              helperText={errors.displayName}
            />

            <FormControl fullWidth>
              <InputLabel>Environment</InputLabel>
              <Select
                value={formData.environment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    environment: e.target.value as any,
                  })
                }
                label="Environment"
              >
                <MenuItem value="dev">Development</MenuItem>
                <MenuItem value="test">Test</MenuItem>
                <MenuItem value="prod">Production</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

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
              helperText={
                errors.endpoint ||
                "Endpoint del tuo storage S3-compatibile (es. MinIO, Ceph, etc.)"
              }
            />

            <TextField
              label="Regione (opzionale)"
              value={formData.region || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  region: e.target.value || undefined,
                })
              }
              fullWidth
              placeholder="us-east-1 (solo per AWS S3)"
              helperText="Richiesto solo per AWS S3. Per MinIO e altri storage S3-compatibili può essere lasciato vuoto."
            />

            <TextField
              label="Nome Bucket"
              value={formData.bucketName}
              onChange={(e) =>
                setFormData({ ...formData, bucketName: e.target.value })
              }
              fullWidth
              required
              error={!!errors.bucketName}
              helperText={errors.bucketName}
            />

            {/* Sensitive fields with additional protection */}
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Credenziali di Accesso
              </Typography>

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
              />

              <TextField
                label="Secret Access Key"
                value={formData.secretAccessKey}
                onChange={(e) =>
                  setFormData({ ...formData, secretAccessKey: e.target.value })
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
                sx={{ mt: 2 }}
              />
            </Box>

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
              label="Path Style (invece di Virtual Hosted)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button type="submit" variant="contained">
            {editingConnection ? "Aggiorna" : "Salva"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ConnectionForm;
