import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildDashboardService } from "../services/dashboardService.js";

const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("ac_api_key") || null
  );
  const [baseUrl, setBaseUrl] = useState(
    () =>
      localStorage.getItem("ac_base_url") ||
      import.meta.env.VITE_API_BASE_URL ||
      "https://n8n-b0be.onrender.com/webhook/academic-api"
  );
  const [activeInstitution, setActiveInstitution] = useState(null);
  const [isSessionChecking, setIsSessionChecking] = useState(true);

  const service = useMemo(
    () => (baseUrl ? buildDashboardService({ baseUrl, apiKey: apiKey || 'temp' }) : null),
    [baseUrl, apiKey]
  );

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      if (!service) return;
      setIsSessionChecking(true);
      try {
        // Intentamos acceder a un endpoint protegido o de checkeo
        // Como no tenemos el método 'checkAuth' en service, usaremos fetch directo o asumiremos
        // que si getOverview falla es por auth.
        // Pero mejor implementamos un check directo.
        const res = await fetch(`${baseUrl}/api/auth/check`, { credentials: 'include' });
        if (res.ok) {
           setApiKey("admin-session-active");
        } else {
           setApiKey(null);
           localStorage.removeItem("ac_api_key");
        }
      } catch (e) {
        // Si falla conexión, asumimos no auth o error red
        // No borramos apiKey si es error de red? 
        // Para seguridad, mejor pedir login.
        setApiKey(null); 
      } finally {
        setIsSessionChecking(false);
      }
    }

    checkSession();
  }, [baseUrl]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("ac_api_key", apiKey);
    } else {
      localStorage.removeItem("ac_api_key");
    }
  }, [apiKey]);

  useEffect(() => {
    if (baseUrl) {
      localStorage.setItem("ac_base_url", baseUrl);
    }
  }, [baseUrl]);

  const value = {
    apiKey,
    setApiKey,
    baseUrl,
    setBaseUrl,
    service,
    activeInstitution,
    setActiveInstitution,
    isSessionChecking
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error("useApi must be used within ApiProvider");
  }
  return ctx;
}
