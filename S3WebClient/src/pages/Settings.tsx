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
  Button,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Security,
  Notifications,
  Storage,
  Palette,
  Cloud,
  Info,
} from "@mui/icons-material";
import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    darkMode: false,
    autoConnect: false,
    debugMode: false,
    language: "it",
    theme: "default",
  });

  const handleSettingChange = (
    setting:
      | "autoSave"
      | "notifications"
      | "darkMode"
      | "autoConnect"
      | "debugMode",
    value: boolean
  ) => {
    setSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const settingCategories = [
    {
      title: "Generali",
      icon: <SettingsIcon />,
      settings: [
        {
          key: "autoSave",
          label: "Salvataggio Automatico",
          description: "Salva automaticamente le modifiche alle connessioni",
          type: "switch",
          value: settings.autoSave,
        },
        {
          key: "autoConnect",
          label: "Connessione Automatica",
          description:
            "Connetti automaticamente all'ultima connessione utilizzata",
          type: "switch",
          value: settings.autoConnect,
        },
      ],
    },
    {
      title: "Interfaccia",
      icon: <Palette />,
      settings: [
        {
          key: "darkMode",
          label: "Modalità Scura",
          description: "Attiva il tema scuro per l'interfaccia",
          type: "switch",
          value: settings.darkMode,
        },
        {
          key: "theme",
          label: "Tema",
          description: "Tema personalizzato dell'applicazione",
          type: "select",
          value: settings.theme,
          options: ["default", "blue", "green", "purple"],
        },
      ],
    },
    {
      title: "Notifiche",
      icon: <Notifications />,
      settings: [
        {
          key: "notifications",
          label: "Notifiche Push",
          description: "Ricevi notifiche per eventi importanti",
          type: "switch",
          value: settings.notifications,
        },
      ],
    },
    {
      title: "Sicurezza",
      icon: <Security />,
      settings: [
        {
          key: "debugMode",
          label: "Modalità Debug",
          description: "Attiva log dettagliati per il debug",
          type: "switch",
          value: settings.debugMode,
        },
      ],
    },
  ];

  const systemInfo = [
    {
      label: "Versione App",
      value: "1.0.0",
      icon: <Info sx={{ color: "info.main" }} />,
    },
    {
      label: "Versione React",
      value: "18.2.0",
      icon: <Info sx={{ color: "info.main" }} />,
    },
    {
      label: "Versione Material-UI",
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
      value: "Locale (Browser)",
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
            sx={{
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "linear-gradient(45deg, #9C27B0 30%, #E1BEE7 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            <SettingsIcon sx={{ fontSize: 32, color: "secondary.main" }} />
            Impostazioni
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Personalizza l'esperienza e configura le preferenze
            dell'applicazione
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
                                  label={setting.value ? "Attivo" : "Disattivo"}
                                  size="small"
                                  color={setting.value ? "success" : "default"}
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5, fontSize: "0.875rem" }}
                            >
                              {setting.description}
                            </Typography>
                          }
                        />
                        {setting.type === "switch" && (
                          <Switch
                            checked={setting.value}
                            onChange={(e) =>
                              handleSettingChange(setting.key, e.target.checked)
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
            Informazioni Sistema
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

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ px: 3, py: 1, borderRadius: 2 }}
          >
            Ripristina Default
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              background: "linear-gradient(45deg, #9C27B0 30%, #E1BEE7 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #7B1FA2 30%, #C2185B 90%)",
              },
            }}
          >
            Salva Impostazioni
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
