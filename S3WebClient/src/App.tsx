import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Buckets from "./pages/Buckets";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Bucket from "./pages/Bucket";
import Notifications from "./pages/Notifications";
import styles from "./App.module.scss";
import { useSettings } from "./contexts/SettingsContext";
import useRealtimeConnectionCheck from "./hooks/useRealtimeConnectionCheck";

function App() {
  const { settings } = useSettings();
  useRealtimeConnectionCheck(settings.realtimeCheck, settings.realtimeInterval);

  return (
    <div className={styles.app}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buckets" element={<Buckets />} />
          <Route path="/bucket/:id" element={<Bucket />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
