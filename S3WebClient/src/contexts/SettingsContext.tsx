/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

export interface Settings {
  notifications: boolean;
  darkMode: boolean;
  debugMode: boolean;
  language: string;
  theme: string;
  realtimeCheck: boolean;
  realtimeInterval: number; // seconds
}

const defaultSettings: Settings = {
  notifications: true,
  darkMode: false,
  debugMode: false,
  language: "it",
  theme: "default",
  realtimeCheck: false,
  realtimeInterval: 60,
};

interface SettingsContextValue {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaultSettings,
  setSetting: () => undefined,
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem("settings");
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const setSetting: SettingsContextValue["setSetting"] = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    try {
      localStorage.setItem("settings", JSON.stringify(settings));
    } catch {
      // ignore write errors
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

