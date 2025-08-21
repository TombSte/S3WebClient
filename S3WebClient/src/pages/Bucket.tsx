import { useParams } from "react-router-dom";
import { useS3Connections } from "../hooks/useS3Connections";
import {
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { Storage as StorageIcon } from "@mui/icons-material";

export default function Bucket() {
  const { id } = useParams();
  const { connections, loading } = useS3Connections();
  const connection = connections.find((c) => c.id === id);

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
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Dettagli del bucket e contenuti
          </Typography>
        </Box>

        {/* Bucket Info */}
        <Card sx={{ mb: 3 }}>
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
                <Typography variant="body1">
                  {connection.environment.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Placeholder for file navigation */}
        <Card>
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
