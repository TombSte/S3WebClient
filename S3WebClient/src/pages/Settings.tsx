import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Storage,
  Palette,
  Cloud,
  Info,
} from "@mui/icons-material";
import { useSettings } from "../contexts/SettingsContext";
import { adminRepository } from "../repositories";
import ConfirmDialog from "../components/ConfirmDialog";
import { useEnvironments } from "../contexts/EnvironmentsContext";

export default function Settings() {
  const { settings, setSetting } = useSettings();
  const { refresh: refreshEnvs } = useEnvironments();
  const [dangerDeleteConnections, setDangerDeleteConnections] = useState(false);
  const [dangerAlsoEnvs, setDangerAlsoEnvs] = useState(false);
  const [confirmDanger, setConfirmDanger] = useState(false);
  const [dangerSuccess, setDangerSuccess] = useState<string | null>(null);

  const handleSettingChange = <K extends keyof typeof settings>(
    setting: K,
    value: (typeof settings)[K]
  ) => {
    setSetting(setting, value);
  };

  const settingCategories = [
    {
      title: "General",
      icon: <SettingsIcon />,
      settings: [
        {
          key: "realtimeCheck",
          label: "Realtime connection checks",
          description:
            "Periodically check connection status",
          type: "switch",
          value: settings.realtimeCheck,
        },
      ],
    },
    {
      title: "Interface",
      icon: <Palette />,
      settings: [
        {
          key: "darkMode",
          label: "Dark Mode",
          description: "Enable dark theme for the UI",
          type: "switch",
          value: settings.darkMode,
        },
        {
          key: "theme",
          label: "Theme",
          description: "Application theme",
          type: "select",
          value: settings.theme,
          options: ["default", "blue", "green", "purple"],
        },
      ],
    },
  ];

  const systemInfo = [
    {
      label: "App Version",
      value: "1.0.0",
      icon: <Info sx={{ color: "info.main" }} />,
    },
    {
      label: "React Version",
      value: "18.2.0",
      icon: <Info sx={{ color: "info.main" }} />,
    },
    {
      label: "Material-UI Version",
      value: "5.15.0",
      icon: <Info sx={{ color: "info.main" }} />,
    },
    {
      label: "Database",
      value: "IndexedDB (Dexie)",
      icon: <Storage sx={{ color: "primary.main" }} />,
    },
    {
      label: "Storage",
      value: "Local (Browser)",
      icon: <Cloud sx={{ color: "success.main" }} />,
    },
  ];

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
            sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 2, color: 'secondary.main', fontWeight: 'bold' }}
          >
            <SettingsIcon sx={{ fontSize: 32, color: "secondary.main" }} />
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Customize the experience and configure application preferences
          </Typography>
        </Box>

        {/* Settings Categories */}
        <Box sx={{ mb: 3 }}>
          {settingCategories.map((category, index) => (
            <Card
              key={index}
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "secondary.50",
                      color: "secondary.main",
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "secondary.main", fontWeight: "bold" }}
                  >
                    {category.title}
                  </Typography>
                </Box>

                <List>
                  {category.settings.map((setting, settingIndex) => (
                    <Box key={settingIndex}>
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold" }}
                              >
                                {setting.label}
                              </Typography>
                              {setting.type === "switch" && (
                                <Chip
                                  label={setting.value ? "Enabled" : "Disabled"}
                                  size="small"
                                  color={setting.value ? "success" : "default"}
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: "0.875rem" }}
                              >
                                {setting.description}
                              </Typography>
                              {setting.key === "realtimeCheck" && settings.realtimeCheck && (
                                <TextField
                                  type="number"
                                  label="Interval (s)"
                                  size="small"
                                  value={settings.realtimeInterval}
                                  onChange={(e) =>
                                    handleSettingChange(
                                      "realtimeInterval",
                                      parseInt(e.target.value, 10) || 0
                                    )
                                  }
                                  sx={{ mt: 1, width: 140 }}
                                  inputProps={{ min: 1 }}
                                />
                              )}
                            </Box>
                          }
                        />
                        {setting.type === "switch" && (
                          <Switch
                            checked={Boolean(setting.value)}
                            onChange={(e) =>
                              handleSettingChange(
                                setting.key as keyof typeof settings,
                                e.target.checked
                              )
                            }
                            color="secondary"
                          />
                        )}
                      </ListItem>
                      {settingIndex < category.settings.length - 1 && (
                        <Divider />
                      )}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </Box>


        {/* System Information */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
          >
            System Information
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
                {systemInfo.map((info, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                    }}
                  >
                    {info.icon}
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.875rem" }}
                      >
                        {info.label}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {info.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Danger Zone */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "error.main", fontWeight: "bold" }}>
            Danger Zone
          </Typography>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Remove local data from this device. This does not affect your S3 storages.
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Delete all connections"
                    secondary="Also removes related cached files, shares and recent locations."
                  />
                  <Switch
                    color="error"
                    checked={dangerDeleteConnections}
                    onChange={(e) => setDangerDeleteConnections(e.target.checked)}
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Also delete environments"
                    secondary="Remove all environments from local DB."
                  />
                  <Switch
                    color="error"
                    checked={dangerAlsoEnvs}
                    onChange={(e) => setDangerAlsoEnvs(e.target.checked)}
                    disabled={!dangerDeleteConnections}
                  />
                </ListItem>
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  disabled={!dangerDeleteConnections}
                  onClick={() => setConfirmDanger(true)}
                >
                  Delete Selected Data
                </Button>
              </Box>
              {dangerSuccess && (
                <Alert severity="success" sx={{ mt: 2 }} onClose={() => setDangerSuccess(null)}>
                  {dangerSuccess}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Options apply immediately on toggle; no action buttons */}
      </Box>

      <ConfirmDialog
        open={confirmDanger}
        title="Confirm deletion"
        message={`This will delete ${dangerDeleteConnections ? 'all connections and related cached data' : ''}${dangerDeleteConnections && dangerAlsoEnvs ? ' and ' : ''}${dangerAlsoEnvs ? 'all environments' : ''}. No changes will be made to your S3 storages. Continue?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDanger(false)}
        onConfirm={async () => {
          try {
            if (dangerDeleteConnections) {
              await adminRepository.clearConnections(true);
            }
            if (dangerDeleteConnections && dangerAlsoEnvs) {
              await adminRepository.clearEnvironments();
            }
            await refreshEnvs();
            setDangerSuccess('Local data deleted successfully.');
          } catch (e) {
            setDangerSuccess('An error occurred while deleting data.');
          } finally {
            setConfirmDanger(false);
            setDangerDeleteConnections(false);
            setDangerAlsoEnvs(false);
          }
        }}
      />
    </Box>
  );
}
