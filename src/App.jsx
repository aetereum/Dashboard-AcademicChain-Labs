import { Routes, Route, Navigate } from "react-router-dom";
import { useApi } from "./state/ApiContext.jsx";
import Login from "./pages/Login.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import Institutions from "./pages/Institutions.jsx";
import ApiKeys from "./pages/ApiKeys.jsx";
import Emissions from "./pages/Emissions.jsx";
import Verification from "./pages/Verification.jsx";
import AuditLogs from "./pages/AuditLogs.jsx";
import Metrics from "./pages/Metrics.jsx";
import Layout from "./components/layout/Layout.jsx";

function PrivateRoute({ children }) {
  const { apiKey, isSessionChecking } = useApi();
  
  if (isSessionChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-brand-500"></div>
          <p className="text-xs font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="metricas" element={<Metrics />} />
        <Route path="instituciones" element={<Institutions />} />
        <Route path="api-keys" element={<ApiKeys />} />
        <Route path="logs" element={<AuditLogs />} />
        <Route path="emisiones" element={<Emissions />} />
        <Route path="verificacion" element={<Verification />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
