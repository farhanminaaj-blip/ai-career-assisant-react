import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/Dashboard";
import GeneratePost from "./pages/GeneratePost";
import GitHubReposPage from "./pages/GitHubReposPage";
import History from "./pages/History";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="generate" element={<GeneratePost />} />
          <Route path="github" element={<GitHubReposPage />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="generatePost" element={<Navigate to="/dashboard/generate" replace />} />
        <Route path="github" element={<Navigate to="/dashboard/github" replace />} />
        <Route path="history" element={<Navigate to="/dashboard/history" replace />} />
        <Route path="settings" element={<Navigate to="/dashboard/settings" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

