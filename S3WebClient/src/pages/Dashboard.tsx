import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
} from "@mui/material";
import {
  Storage,
  Cloud,
  Security,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Info,
} from "@mui/icons-material";

export default function Dashboard() {
  // Mock data for demonstration
  const stats = {
    totalConnections: 12,
    activeConnections: 8,
    inactiveConnections: 4,
    totalBuckets: 24,
    lastActivity: "2 ore fa",
  };

  const recentActivity = [
    {
      type: "success",
      message: "Connessione a MinIO testata con successo",
      time: "5 min fa",
    },
    {
      type: "info",
      message: "Nuova connessione AWS S3 creata",
      time: "1 ora fa",
    },
    {
      type: "warning",
      message: "Connessione Ceph in timeout",
      time: "3 ore fa",
    },
    {
      type: "error",
      message: "Errore di autenticazione per bucket 'backup'",
      time: "1 giorno fa",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle sx={{ color: "success.main" }} />;
      case "warning":
        return <Warning sx={{ color: "warning.main" }} />;
      case "error":
        return <Error sx={{ color: "error.main" }} />;
      default:
        return <Info sx={{ color: "info.main" }} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

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
      <Box sx={{ width: "100%", p: 2 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              mb: 1.5,
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
            <Storage sx={{ fontSize: 32, color: "primary.main" }} />
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Benvenuto nel tuo client S3 Web. Monitora e gestisci le tue
            connessioni storage.
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
          >
            Panoramica
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 2,
            }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {stats.totalConnections}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                    >
                      Connessioni Totali
                    </Typography>
                  </Box>
                  <Storage sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(240, 147, 251, 0.4)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {stats.activeConnections}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                    >
                      Connessioni Attive
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(79, 172, 254, 0.4)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {stats.totalBuckets}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                    >
                      Bucket Totali
                    </Typography>
                  </Box>
                  <Cloud sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(67, 233, 123, 0.4)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {stats.lastActivity}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                    >
                      Ultima Attività
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
          >
            Attività Recenti
          </Typography>
          <Paper sx={{ p: 2.5, borderRadius: 2 }}>
            {recentActivity.map((activity, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  py: 1,
                  borderBottom:
                    index < recentActivity.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                }}
              >
                {getActivityIcon(activity.type)}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                    {activity.message}
                  </Typography>
                </Box>
                <Chip
                  label={activity.time}
                  size="small"
                  color={getActivityColor(activity.type)}
                  variant="outlined"
                />
              </Box>
            ))}
          </Paper>
        </Box>

        {/* Quick Actions */}
        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
          >
            Azioni Rapide
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 2,
            }}
          >
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  bgcolor: "primary.50",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2.5 }}>
                <Storage
                  sx={{ fontSize: 32, color: "primary.main", mb: 1.5 }}
                />
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  Nuova Connessione
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Configura una nuova connessione S3
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  bgcolor: "success.50",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2.5 }}>
                <CheckCircle
                  sx={{ fontSize: 32, color: "success.main", mb: 1.5 }}
                />
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  Test Connessioni
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Verifica lo stato delle connessioni
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  bgcolor: "info.50",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2.5 }}>
                <Security sx={{ fontSize: 32, color: "info.main", mb: 1.5 }} />
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  Impostazioni
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Configura le preferenze dell'app
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
