import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email,
  CalendarToday,
  LocationOn,
  Work,
  Star,
  Edit,
  Settings,
  Cloud,
  Storage,
  CheckCircle,
  TrendingUp,
} from "@mui/icons-material";

export default function Profile() {
  // Mock user data
  const user = {
    name: "Stefano Tomba",
    email: "stefano.tomba@example.com",
    avatar: "ST",
    role: "Sviluppatore Full-Stack",
    company: "Tech Solutions",
    location: "Milano, Italia",
    joinDate: "Gennaio 2024",
    bio: "Sviluppatore appassionato di tecnologie cloud e storage distribuito. Specializzato in S3-compatible storage e applicazioni web moderne.",
    skills: ["React", "TypeScript", "AWS S3", "MinIO", "Docker", "Node.js"],
    stats: {
      connectionsCreated: 15,
      totalBuckets: 28,
      activeConnections: 12,
      lastLogin: "2 ore fa",
    },
  };

  const recentActivity = [
    {
      action: "Connessione creata",
      target: "MinIO Production",
      time: "5 min fa",
      type: "success",
    },
    {
      action: "Test connessione",
      target: "AWS S3 Backup",
      time: "1 ora fa",
      type: "info",
    },
    {
      action: "Bucket eliminato",
      target: "temp-storage",
      time: "3 ore fa",
      type: "warning",
    },
    {
      action: "Connessione modificata",
      target: "Ceph Cluster",
      time: "1 giorno fa",
      type: "info",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle sx={{ color: "success.main" }} />;
      case "warning":
        return <Star sx={{ color: "warning.main" }} />;
      case "info":
        return <TrendingUp sx={{ color: "info.main" }} />;
      default:
        return <CheckCircle sx={{ color: "primary.main" }} />;
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
      <Box sx={{ width: "100%" }}>
        {/* Profile Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "linear-gradient(45deg, #FF6B6B 30%, #FFE66D 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            <PersonIcon sx={{ fontSize: 32, color: "error.main" }} />
            Profilo Utente
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Gestisci il tuo profilo e visualizza le statistiche personali
          </Typography>
        </Box>

        {/* Profile Card */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: 100,
              background: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
              position: "relative",
            }}
          />
          <CardContent sx={{ p: 3, pt: 0 }}>
            <Box
              sx={{ display: "flex", alignItems: "flex-end", gap: 3, mb: 2.5 }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 40,
                  fontWeight: "bold",
                  border: "4px solid white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  bgcolor: "primary.main",
                  mt: -50,
                }}
              >
                {user.avatar}
              </Avatar>
              <Box sx={{ flex: 1, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  {user.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {user.role}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    icon={<Work />}
                    label={user.company}
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    icon={<LocationOn />}
                    label={user.location}
                    variant="outlined"
                    color="secondary"
                  />
                  <Chip
                    icon={<CalendarToday />}
                    label={`Membro dal ${user.joinDate}`}
                    variant="outlined"
                    color="info"
                  />
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  sx={{ borderRadius: 2 }}
                >
                  Modifica
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Settings />}
                  sx={{
                    borderRadius: 2,
                    background:
                      "linear-gradient(45deg, #FF6B6B 30%, #FFE66D 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #FF5252 30%, #FFD600 90%)",
                    },
                  }}
                >
                  Impostazioni
                </Button>
              </Box>
            </Box>

            <Typography variant="body1" sx={{ mb: 2.5, lineHeight: 1.6 }}>
              {user.bio}
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 1.5, fontWeight: "bold" }}>
                Competenze
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {user.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
          >
            Statistiche Personali
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
                      {user.stats.connectionsCreated}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                    >
                      Connessioni Create
                    </Typography>
                  </Box>
                  <Cloud sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {user.stats.totalBuckets}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                    >
                      Bucket Totali
                    </Typography>
                  </Box>
                  <Storage sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {user.stats.activeConnections}
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
                      {user.stats.lastLogin}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                    >
                      Ultimo Accesso
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
            <List>
              {recentActivity.map((activity, index) => (
                <Box key={index}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
                        >
                          {activity.action}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {activity.target}
                        </Typography>
                      }
                    />
                    <Chip
                      label={activity.time}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Contact Information */}
        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
          >
            Informazioni di Contatto
          </Typography>
          <Card
            sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Email sx={{ color: "primary.main", fontSize: 20 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      Email
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Work sx={{ color: "secondary.main", fontSize: 20 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      Azienda
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {user.company}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <LocationOn sx={{ color: "success.main", fontSize: 20 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      Località
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {user.location}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CalendarToday sx={{ color: "info.main", fontSize: 20 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      Membro dal
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {user.joinDate}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
