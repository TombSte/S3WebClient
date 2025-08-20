import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { Storage, CloudUpload, Folder, Settings } from "@mui/icons-material";
import Layout from "./components/Layout";
import "./App.css";

function App() {
  return (
    <Layout>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Welcome Section */}
        <Paper
          elevation={0}
          sx={{ p: 4, mb: 4, backgroundColor: "transparent" }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Welcome to S3 Web Client
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Manage your AWS S3 buckets, files, and storage with ease
          </Typography>
        </Paper>

        {/* Quick Actions Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "transform 0.2s",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Storage sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                  Buckets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage your S3 buckets
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button size="small" variant="outlined">
                  View Buckets
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "transform 0.2s",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Folder sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                  Files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse and organize your files
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button size="small" variant="outlined">
                  Browse Files
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "transform 0.2s",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <CloudUpload
                  sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6" component="h2" gutterBottom>
                  Upload
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload files to your buckets
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button size="small" variant="outlined">
                  Upload Files
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "transform 0.2s",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Settings sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                  Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure your preferences
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button size="small" variant="outlined">
                  Configure
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity Section */}
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Recent Activity
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No recent activity to display. Start by exploring your buckets or
            uploading files.
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
}

export default App;
