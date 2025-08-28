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
    lastLogin: "No activity",
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  const formatTimeAgo = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
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
      const lastLogin = lastEntry ? formatTimeAgo(lastEntry.timestamp) : "No activity";
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

  const contactItems = [
    {
      icon: <Email sx={{ color: "primary.main", fontSize: 20 }} />,
      label: "Email",
      value: profile.email,
    },
    {
      icon: <Work sx={{ color: "secondary.main", fontSize: 20 }} />,
      label: "Company",
      value: profile.company,
    },
    {
      icon: <LocationOn sx={{ color: "success.main", fontSize: 20 }} />,
      label: "Location",
      value: profile.location,
    },
    {
      icon: <CalendarToday sx={{ color: "info.main", fontSize: 20 }} />,
      label: "Member since",
      value: profile.joinDate,
    },
  ].filter((item) => item.value);

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
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ width: "100%" }}>
        {/* Profile Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 2, color: 'error.main', fontWeight: 'bold' }}
          >
            <PersonIcon sx={{ fontSize: 32, color: "error.main" }} />
            User Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Manage your profile and view personal statistics
          </Typography>
        </Box>

        {/* Profile Card */}
        <Card sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
          <Box
            sx={{ height: 56, bgcolor: "background.paper", position: "relative", borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
          />
          <CardContent sx={{ p: 3, pt: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "center", sm: "flex-end" },
                flexDirection: { xs: "column", sm: "row" },
                textAlign: { xs: "center", sm: "left" },
                gap: 3,
                mb: 2.5,
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  fontSize: { xs: 32, sm: 40 },
                  fontWeight: "bold",
                  border: "4px solid white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  bgcolor: "primary.main",
                  mt: { xs: -28, sm: -36 },
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ flex: 1, mb: 1 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  {profile.name}
                </Typography>
                {profile.role && (
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {profile.role}
                  </Typography>
                )}
                {(profile.company || profile.location || profile.joinDate) && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                      justifyContent: { xs: "center", sm: "flex-start" },
                    }}
                  >
                    {profile.company && (
                      <Chip
                        icon={<Work />}
                        label={profile.company}
                        variant="outlined"
                        color="primary"
                      />
                    )}
                    {profile.location && (
                      <Chip
                        icon={<LocationOn />}
                        label={profile.location}
                        variant="outlined"
                        color="secondary"
                      />
                    )}
                    {profile.joinDate && (
                      <Chip
                        icon={<CalendarToday />}
                        label={`Member since ${profile.joinDate}`}
                        variant="outlined"
                        color="info"
                      />
                    )}
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: { xs: 2, sm: 0 },
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: { xs: "center", sm: "flex-end" },
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  sx={{ borderRadius: 2 }}
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
              </Box>
            </Box>

            {profile.bio && (
              <Typography variant="body1" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                {profile.bio}
              </Typography>
            )}

            {profile.skills.length > 0 && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: "bold" }}>
                  Skills
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
            )}
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
          >
            Personal Statistics
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
                      Connections Created
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
                      Total Buckets
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
                      Active Connections
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
                      Last Login
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
            Recent Activity
          </Typography>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
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
        {contactItems.length > 0 && (
          <Box>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
            >
              Contact Information
            </Typography>
            <Card
              sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 2,
                  }}
                >
                  {contactItems.map((item, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      {item.icon}
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
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
