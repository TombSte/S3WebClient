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
import { useEffect, useState } from "react";
import { activityRepository, connectionRepository, profileRepository } from "../repositories";
import type { UserProfile } from "../types/profile";
import EditProfileDialog from "../components/EditProfileDialog";

interface ActivityItem {
  type: string;
  message: string;
  time: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "",
    company: "",
    location: "",
    joinDate: "",
    bio: "",
    skills: [],
  });

  const [stats, setStats] = useState({
    connectionsCreated: 0,
    totalBuckets: 0,
    activeConnections: 0,
    lastLogin: "Nessuna attività",
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  const formatTimeAgo = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Adesso";
    if (minutes < 60) return `${minutes} min fa`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ore fa`;
    const days = Math.floor(hours / 24);
    return `${days} giorni fa`;
  };

  useEffect(() => {
    const loadData = async () => {
      const p = await profileRepository.get();
      if (p) setProfile(p);

      const connections = await connectionRepository.getAll();
      const connectionsCreated = connections.length;
      const activeConnections = connections.filter((c) => c.isActive === 1).length;
      const totalBuckets = new Set(connections.map((c) => c.bucketName)).size;
      const lastEntry = await activityRepository.getLast();
      const lastLogin = lastEntry ? formatTimeAgo(lastEntry.timestamp) : "Nessuna attività";
      setStats({ connectionsCreated, totalBuckets, activeConnections, lastLogin });

      const activities = await activityRepository.getRecent(5);
      const formatted = activities.map((act) => ({
        type: act.type,
        message: act.message,
        time: formatTimeAgo(act.timestamp),
      }));
      setRecentActivity(formatted);
    };
    loadData();
  }, []);

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

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0]?.toUpperCase())
        .join("")
        .slice(0, 2)
    : "";

  const handleSave = async (p: UserProfile) => {
    await profileRepository.save(p);
    setProfile(p);
    setEditOpen(false);
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
                {initials}
              </Avatar>
              <Box sx={{ flex: 1, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  {profile.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {profile.role}
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
                    label={profile.company}
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    icon={<LocationOn />}
                    label={profile.location}
                    variant="outlined"
                    color="secondary"
                  />
                  <Chip
                    icon={<CalendarToday />}
                    label={`Membro dal ${profile.joinDate}`}
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
                  onClick={() => setEditOpen(true)}
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
              {profile.bio}
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 1.5, fontWeight: "bold" }}>
                Competenze
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {profile.skills.map((skill, index) => (
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
                      {stats.connectionsCreated}
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
                      {stats.totalBuckets}
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
                      {stats.lastLogin}
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
                          {activity.message}
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
                      {profile.email}
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
                      {profile.company}
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
                      {profile.location}
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
                      {profile.joinDate}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <EditProfileDialog
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
