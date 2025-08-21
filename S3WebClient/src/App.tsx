import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Buckets from "./pages/Buckets";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Bucket from "./pages/Bucket";
import "./App.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/buckets" element={<Buckets />} />
        <Route path="/bucket/:id" element={<Bucket />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}

export default App;
