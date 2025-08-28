import {
  Box,
  Typography,
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
import { useEffect, useState } from "react";
import { connectionRepository, activityRepository } from "../repositories";

interface Activity {
  type: string;
  message: string;
  time: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalConnections: 0,
    activeConnections: 0,
    inactiveConnections: 0,
    totalBuckets: 0,
    connectedBuckets: 0,
    lastActivity: "No activity",
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

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
    const loadDashboardData = async () => {
      const connections = await connectionRepository.getAll();
      const totalConnections = connections.length;
      const activeConnections = connections.filter((c) => c.isActive === 1).length;
      const inactiveConnections = totalConnections - activeConnections;
      const totalBuckets = new Set(connections.map((c) => c.bucketName)).size;
      const connectedBuckets = new Set(
        connections
          .filter((c) => c.testStatus === "success")
          .map((c) => c.bucketName)
      ).size;

      const lastEntry = await activityRepository.getLast();
      const lastActivity = lastEntry
        ? formatTimeAgo(lastEntry.timestamp)
        : "No activity";

      setStats({
        totalConnections,
        activeConnections,
        inactiveConnections,
        totalBuckets,
        connectedBuckets,
        lastActivity,
      });

      const activities = await activityRepository.getRecent(5);

      const formatted: Activity[] = activities.map((act) => ({
        type: act.type,
        message: act.message,
        time: formatTimeAgo(act.timestamp),
      }));

      setRecentActivity(formatted);
    };

    loadDashboardData();
  }, []);

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
      <Box sx={{ width: "100%" }}>
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
            Welcome to your S3 Web client. Monitor and manage your storage connections.
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
          >
            Overview
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
                border: 'none',
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" },
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
                      sx={{ opacity: 0.9, fontSize: "0.875rem", color: 'inherit' }}
                    >
                      Total Connections
                    </Typography>
                  </Box>
                  <Storage sx={{ fontSize: 40, opacity: 0.8, color: 'inherit' }} />
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                border: 'none',
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" },
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
                      {stats.connectedBuckets}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.875rem", color: 'inherit' }}
                    >
                      Connected Buckets
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8, color: 'inherit' }} />
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                border: 'none',
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" },
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
                      sx={{ opacity: 0.9, fontSize: "0.875rem", color: 'inherit' }}
                    >
                      Total Buckets
                    </Typography>
                  </Box>
                  <Cloud sx={{ fontSize: 40, opacity: 0.8, color: 'inherit' }} />
                </Box>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white",
                border: 'none',
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" },
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
                      sx={{ opacity: 0.9, fontSize: "0.875rem", color: 'inherit' }}
                    >
                      Last Activity
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.8, color: 'inherit' }} />
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
            Quick Actions
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
                  New Connection
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Set up a new S3 connection
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
                  Test Connections
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Check the status of connections
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
                  Settings
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Configure app preferences
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
